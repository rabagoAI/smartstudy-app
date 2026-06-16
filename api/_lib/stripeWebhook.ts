// api/_lib/stripeWebhook.ts
// Lógica de negocio del webhook de Stripe, extraída para poder testearla sin
// red ni firma. webhook.ts se encarga de verificar la firma y pasar aquí el
// evento ya validado junto con `db` (Firestore Admin) y `stripe`.

import type Stripe from 'stripe';
import type { Firestore } from 'firebase-admin/firestore';

// Convierte el trial_end de Stripe (epoch en segundos, o null) a Date o null.
export function trialEndToDate(trialEnd: number | null | undefined): Date | null {
  return trialEnd ? new Date(trialEnd * 1000) : null;
}

// Aplica los efectos en Firestore de un evento de Stripe ya verificado.
// Lanza si alguna operación de Firestore/Stripe falla (lo captura webhook.ts).
export async function handleStripeEvent(
  event: Stripe.Event,
  db: Firestore,
  stripe: Stripe
): Promise<void> {
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
          trialEnd: trialEndToDate(subscription.trial_end),
        },
        { merge: true }
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const uid = subscription.metadata?.firebaseUid;

      if (!uid) {
        // Sin metadata: localizar al usuario por su stripeCustomerId
        const snap = await db
          .collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          await snap.docs[0].ref.set(
            {
              subscriptionStatus: subscription.status,
              trialEnd: trialEndToDate(subscription.trial_end),
            },
            { merge: true }
          );
        }
        break;
      }

      await db.collection('users').doc(uid).set(
        {
          subscriptionStatus: subscription.status,
          trialEnd: trialEndToDate(subscription.trial_end),
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
      // Eventos no manejados: se ignoran a propósito.
      break;
  }
}
