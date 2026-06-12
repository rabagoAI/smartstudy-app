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

  if (!getApps().length) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const db = getFirestore();
  const userDoc = await db.collection('users').doc(uid).get();
  const customerId = userDoc.data()?.stripeCustomerId as string | undefined;

  if (!customerId) {
    return res.status(404).json({ error: 'No Stripe customer found for this user' });
  }

  // Dominio canónico de la app. VERCEL_URL es el dominio interno del deploy
  // (cambia en cada despliegue y no es el dominio real), así que solo sirve de
  // fallback para previews. En producción define APP_BASE_URL=https://tu-dominio.
  const baseUrl =
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/perfil`,
  });

  return res.status(200).json({ url: portalSession.url });
}
