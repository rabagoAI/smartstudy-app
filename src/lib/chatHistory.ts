// src/lib/chatHistory.ts
// Construye el array `contents` para la API de Gemini a partir del historial del
// chat, recortándolo por presupuesto de caracteres para no chocar con el tope
// del servidor (api/gemini.js rechaza con 413 si el JSON de contents > 30k chars).

export interface ChatMessage {
  role?: string;
  content?: unknown;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Margen seguro por debajo del tope de 30k del servidor: deja hueco para los
// mensajes de sistema y el overhead del JSON.
export const MAX_HISTORY_CHARS = 22000;

// Nº máximo de mensajes previos a considerar (ventana de contexto del chat).
export const MAX_HISTORY_MESSAGES = 10;

/**
 * Devuelve el historial saneado y recortado, con el mensaje actual al final.
 * Descarta los mensajes más antiguos primero hasta caber en `maxChars`.
 */
export function buildChatHistory(
  messages: ChatMessage[],
  currentText: string,
  maxChars: number = MAX_HISTORY_CHARS
): GeminiContent[] {
  const valid = messages.filter(
    (m): m is ChatMessage & { content: string } =>
      !!m && typeof m.content === 'string' && m.content.length > 0
  );

  const recent = valid.slice(-MAX_HISTORY_MESSAGES);
  const history: GeminiContent[] = [];
  let usedChars = currentText.length;

  for (let i = recent.length - 1; i >= 0; i--) {
    const msg = recent[i];
    if (usedChars + msg.content.length > maxChars) break;
    usedChars += msg.content.length;
    history.unshift({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  history.push({ role: 'user', parts: [{ text: currentText }] });
  return history;
}
