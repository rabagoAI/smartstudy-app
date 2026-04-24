// Vercel serverless function — proxy hacia la API de Gemini.
// La clave GEMINI_API_KEY vive solo aquí, nunca llega al bundle del cliente.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
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
