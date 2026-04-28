import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin once per cold start (module is cached on warm invocations)
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    initializeApp({ credential: cert(JSON.parse(serviceAccountKey)) });
  }
}

const LIMITS = {
  free: { perMinute: 5, perHour: 20 },
  premium: { perMinute: 20, perHour: 100 },
};

async function checkAndIncrementRateLimit(uid, isPremium) {
  // If Admin SDK is not initialized (missing env var), skip enforcement
  if (!getApps().length) return { allowed: true };

  const limits = isPremium ? LIMITS.premium : LIMITS.free;
  const db = getFirestore();
  const ref = db.collection('rate_limits').doc(uid);
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};

    let { minuteCount = 0, minuteReset = now + 60000, hourCount = 0, hourReset = now + 3600000 } = data;

    if (now > minuteReset) { minuteCount = 0; minuteReset = now + 60000; }
    if (now > hourReset) { hourCount = 0; hourReset = now + 3600000; }

    if (minuteCount >= limits.perMinute) {
      return { allowed: false, error: 'Demasiadas peticiones por minuto. Espera un momento.', retryAfter: minuteReset };
    }
    if (hourCount >= limits.perHour) {
      return { allowed: false, error: 'Límite por hora alcanzado. Vuelve más tarde.', retryAfter: hourReset };
    }

    tx.set(ref, { uid, minuteCount: minuteCount + 1, minuteReset, hourCount: hourCount + 1, hourReset, updatedAt: now });
    return { allowed: true };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  // Verify Firebase ID token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let uid;
  try {
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }

  // Server-side rate limiting via Firestore transaction
  try {
    const result = await checkAndIncrementRateLimit(uid, false);
    if (!result.allowed) {
      return res.status(429).json({ error: result.error, retryAfter: result.retryAfter });
    }
  } catch (err) {
    // Allow the request through if rate limit infra fails — don't punish users for it
    console.error('Rate limit check failed:', err.message);
  }

  const { contents, model = 'gemini-2.5-flash' } = req.body;

  if (!contents || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Invalid request: contents array required' });
  }

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );

  const data = await geminiRes.json();
  return res.status(geminiRes.status).json(data);
}
