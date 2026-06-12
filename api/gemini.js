import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

// Emite una línea de alerta estructurada (un solo JSON) que Vercel captura en
// los logs. El prefijo [ALERT] permite configurar una alerta de log/drain:
// cada vez que un control de abuso falla y la petición pasa SIN límite (fail-open),
// queda registrado con contexto para poder reaccionar.
function logAlert(event, detail = {}) {
  try {
    console.error(`[ALERT] ${event} ${JSON.stringify({ event, ...detail, at: new Date().toISOString() })}`);
  } catch {
    console.error(`[ALERT] ${event}`);
  }
}

// Cuota mensual de usos de IA por plan. Debe coincidir con AI_USAGE_LIMITS
// del frontend (src/hooks/useSubscription.ts).
const MONTHLY_LIMITS = { free: 3, basic: 20 };

// Tope de tamaño del prompt para evitar abuso de coste (caracteres totales).
const MAX_CONTENTS_CHARS = 30000;

// Tope de entradas en el array contents (p.ej. historial de chat).
const MAX_CONTENTS_ENTRIES = 100;

// Modelos permitidos. Evita que un cliente pida modelos arbitrarios/caros.
const ALLOWED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.0-flash']);

// Roles válidos en la API de Gemini.
const VALID_ROLES = new Set(['user', 'model']);

// Valida que contents tenga la forma esperada por la API de Gemini:
// [{ role?: 'user'|'model', parts: [{ text: string }, ...] }, ...]
// Devuelve un string con el error, o null si es válido.
function validateContents(contents) {
  if (!Array.isArray(contents) || contents.length === 0) {
    return 'Invalid request: contents must be a non-empty array';
  }
  if (contents.length > MAX_CONTENTS_ENTRIES) {
    return 'Invalid request: too many content entries';
  }
  for (const entry of contents) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return 'Invalid request: malformed content entry';
    }
    if (entry.role !== undefined && !VALID_ROLES.has(entry.role)) {
      return 'Invalid request: invalid role';
    }
    if (!Array.isArray(entry.parts) || entry.parts.length === 0) {
      return 'Invalid request: each content entry needs a non-empty parts array';
    }
    for (const part of entry.parts) {
      if (!part || typeof part.text !== 'string') {
        return 'Invalid request: each part must have a text string';
      }
    }
  }
  return null;
}

// Conteo de cuota mensual en el servidor (fuente de verdad, no evadible).
// Devuelve el plan/premium leídos para reusarlos sin otra lectura.
async function checkAndIncrementMonthlyUsage(uid) {
  if (!getApps().length) return { allowed: true, plan: 'free', isPremium: false };

  const db = getFirestore();
  const ref = db.collection('users').doc(uid);
  const now = new Date();
  const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const plan = data.plan === 'basic' ? 'basic' : 'free';
    const isPremium = data.premium === true;
    const limit = MONTHLY_LIMITS[plan];

    const storedMonth = data.aiUsageMonth ?? 0;
    const usage = storedMonth === currentMonth ? (data.aiUsageThisMonth ?? 0) : 0;

    if (usage >= limit) {
      return { allowed: false, plan, isPremium, usage, limit };
    }

    tx.set(
      ref,
      {
        aiUsageThisMonth: usage + 1,
        aiUsageMonth: currentMonth,
        aiUsageUpdatedAt: Date.now(),
      },
      { merge: true }
    );

    return { allowed: true, plan, isPremium, usage: usage + 1, limit };
  });
}

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

  // ── Validación de entrada (antes de consumir cuota o llamar a Gemini) ──────────
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { contents, model = 'gemini-2.5-flash' } = body;

  const contentsError = validateContents(contents);
  if (contentsError) {
    return res.status(400).json({ error: contentsError });
  }

  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: 'Invalid model' });
  }

  // Tope de tamaño del prompt para evitar abuso de coste
  if (JSON.stringify(contents).length > MAX_CONTENTS_CHARS) {
    return res.status(413).json({ error: 'El contenido es demasiado largo. Reduce el texto e inténtalo de nuevo.' });
  }

  // Leer premium desde Firestore para respetar el plan del usuario (rate limit/min)
  let isPremium = false;
  if (getApps().length) {
    try {
      const userSnap = await getFirestore().collection('users').doc(uid).get();
      isPremium = userSnap.exists && userSnap.data()?.premium === true;
    } catch {
      // Si falla la lectura, tratamos al usuario como free
    }
  }

  // Server-side rate limiting por minuto/hora (anti-ráfagas)
  try {
    const result = await checkAndIncrementRateLimit(uid, isPremium);
    if (!result.allowed) {
      return res.status(429).json({ error: result.error, reason: 'rate_limit', retryAfter: result.retryAfter });
    }
  } catch (err) {
    // Fail-open: dejamos pasar para no penalizar al usuario por un fallo de infra,
    // pero lo registramos como alerta porque deja la puerta abierta a ráfagas.
    logAlert('rate_limit_fail_open', { uid, error: err.message });
  }

  // Cuota mensual por plan (fuente de verdad en el servidor, NO evadible).
  // Se consume solo después de pasar el rate-limit, justo antes de llamar a Gemini.
  let monthly = { allowed: true };
  try {
    monthly = await checkAndIncrementMonthlyUsage(uid);
    if (!monthly.allowed) {
      const upsell = monthly.plan === 'free'
        ? ' Actualiza al Plan Básico para 20 usos al mes.'
        : '';
      return res.status(429).json({
        error: `Has alcanzado tu límite mensual de IA (${monthly.usage}/${monthly.limit}).${upsell}`,
        reason: 'monthly_limit',
        plan: monthly.plan,
        limit: monthly.limit,
      });
    }
  } catch (err) {
    // Fail-open: si la infra de cuota falla no bloqueamos al usuario, pero esto
    // reabre la exposición de coste (llamadas a Gemini sin tope mensual), así que
    // lo registramos como alerta para poder reaccionar ante un fallo sostenido.
    logAlert('monthly_quota_fail_open', { uid, error: err.message });
  }

  // Retry up to 3 times on 503 (Gemini overload) with exponential backoff
  let geminiRes;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );
    if (geminiRes.status !== 503) break;
  }

  // Si Gemini falla tras los reintentos, reembolsamos el crédito mensual consumido
  // para no cobrar al usuario un uso que no obtuvo respuesta.
  if (!geminiRes.ok && monthly.allowed && getApps().length) {
    try {
      await getFirestore().collection('users').doc(uid).update({
        aiUsageThisMonth: FieldValue.increment(-1),
      });
    } catch (err) {
      console.error('Failed to refund monthly usage credit:', err.message);
    }
  }

  const data = await geminiRes.json();
  return res.status(geminiRes.status).json(data);
}
