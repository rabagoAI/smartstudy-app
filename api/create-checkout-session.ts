import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

if (!getApps().length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) initializeApp({ credential: cert(JSON.parse(key)) });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let uid: string;
  try {
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { email, planId } = req.body as { email: string; planId: string };

  if (!email || !planId) {
    return res.status(400).json({ error: 'Missing email or planId' });
  }

  const priceId = planId === 'basic' ? process.env.STRIPE_BASIC_PRICE_ID : null;
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid planId' });
  }

  // Reusar customerId si ya existe en Firestore
  let customerId: string | undefined;
  if (getApps().length) {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    customerId = userDoc.data()?.stripeCustomerId;
  }

  // Dominio canónico de la app. VERCEL_URL es el dominio interno del deploy
  // (cambia en cada despliegue y no es el dominio real), así que solo sirve de
  // fallback para previews. En producción define APP_BASE_URL=https://tu-dominio.
  const baseUrl =
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    customer_email: customerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { firebaseUid: uid },
    },
    metadata: { firebaseUid: uid },
    success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    // /precios no existe como ruta SPA; enviamos al perfil (ruta real con
    // gestión de suscripción) para no aterrizar en una página en blanco.
    cancel_url: `${baseUrl}/perfil`,
  });

  return res.status(200).json({ url: session.url });
}
