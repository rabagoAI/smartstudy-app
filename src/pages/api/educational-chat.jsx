//pages/api/educational-chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message, history = [] } = req.body;
    
    // Inicializa Gemini
    const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Eres un profesor de ESO experto en todas las asignaturas. 
        Responde de forma clara, sencilla y didáctica. Usa ejemplos, analogías y pasos si es necesario.
        No uses jerga técnica sin explicarla. Si no sabes la respuesta, di que no puedes ayudar con eso.`
    });

    // Prepara el historial
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Inicia el chat
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error('Error en el chat educativo:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}