import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!getApps().length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) initializeApp({ credential: cert(JSON.parse(key)) });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Vercel parsea el body por defecto — necesitamos el raw buffer para verificar firma
export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  if (!getApps().length) {
    console.error('Firebase Admin not initialized');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const db = getFirestore();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUid;
        if (!uid) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await db.collection('users').doc(uid).set(
          {
            premium: true,
            plan: 'basic',
            stripeCustomerId: session.customer as string,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
          { merge: true }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebaseUid;
        if (!uid) {
          // Buscar por customerId si no hay metadata
          const snap = await db
            .collection('users')
            .where('stripeCustomerId', '==', subscription.customer)
            .limit(1)
            .get();
          if (!snap.empty) {
            await snap.docs[0].ref.set(
              {
                subscriptionStatus: subscription.status,
                trialEnd: subscription.trial_end
                  ? new Date(subscription.trial_end * 1000)
                  : null,
              },
              { merge: true }
            );
          }
          break;
        }
        await db.collection('users').doc(uid).set(
          {
            subscriptionStatus: subscription.status,
            trialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
          { merge: true }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const snap = await db
          .collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          await snap.docs[0].ref.set(
            { premium: false, subscriptionStatus: 'canceled', plan: 'free' },
            { merge: true }
          );
        }
        break;
      }

      default:
        // Ignorar eventos no manejados
        break;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook handler error:', message);
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(200).json({ received: true });
}
