import { describe, it, expect } from 'vitest';
import { buildChatHistory, MAX_HISTORY_MESSAGES } from './chatHistory';

describe('buildChatHistory', () => {
  it('siempre añade el mensaje actual al final como user', () => {
    const result = buildChatHistory([], 'hola');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ role: 'user', parts: [{ text: 'hola' }] });
  });

  it('mapea el rol assistant a model y user a user', () => {
    const messages = [
      { role: 'user', content: 'pregunta' },
      { role: 'assistant', content: 'respuesta' },
    ];
    const result = buildChatHistory(messages, 'siguiente');
    expect(result.map(c => c.role)).toEqual(['user', 'model', 'user']);
  });

  it('descarta mensajes vacíos o con content no-string', () => {
    const messages = [
      { role: 'user', content: '' },
      { role: 'assistant', content: null as unknown as string },
      { role: 'user', content: 'válido' },
    ];
    const result = buildChatHistory(messages, 'actual');
    // Solo el "válido" + el actual
    expect(result).toHaveLength(2);
    expect(result[0].parts[0].text).toBe('válido');
  });

  it('limita la ventana a los últimos MAX_HISTORY_MESSAGES mensajes', () => {
    const messages = Array.from({ length: MAX_HISTORY_MESSAGES + 5 }, (_, i) => ({
      role: 'user',
      content: `m${i}`,
    }));
    const result = buildChatHistory(messages, 'actual');
    // como máximo MAX_HISTORY_MESSAGES previos + el actual
    expect(result.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES + 1);
  });

  it('recorta los mensajes más antiguos cuando se supera el presupuesto de chars', () => {
    const messages = [
      { role: 'user', content: 'A'.repeat(80) },
      { role: 'assistant', content: 'B'.repeat(80) },
      { role: 'user', content: 'C'.repeat(80) },
    ];
    // Presupuesto pequeño: solo cabe el más reciente (C) + el actual
    const result = buildChatHistory(messages, 'actual', 100);
    const texts = result.map(c => c.parts[0].text);
    expect(texts).toContain('actual');
    expect(texts.some(t => t.startsWith('C'))).toBe(true);
    expect(texts.some(t => t.startsWith('A'))).toBe(false);
  });

  it('nunca supera el presupuesto sumando los chars del historial + actual', () => {
    const messages = Array.from({ length: 10 }, () => ({
      role: 'user',
      content: 'X'.repeat(5000),
    }));
    const maxChars = 22000;
    const current = 'pregunta actual';
    const result = buildChatHistory(messages, current, maxChars);
    const historyChars = result
      .slice(0, -1)
      .reduce((sum, c) => sum + c.parts[0].text.length, 0);
    expect(historyChars + current.length).toBeLessThanOrEqual(maxChars);
  });
});
