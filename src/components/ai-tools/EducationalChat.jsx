// src/components/ai-tools/EducationalChat.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EducationalChat.css';

const EducationalChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();
  const apiKey = import.meta.env.VITE_APP_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Verificar que tenemos la API key
    if (!apiKey) {
      alert('Error: Clave API de Gemini no configurada. Verifica .env.local');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Preparar historial para contexto
      const chatHistory = messages.slice(-4).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Añadir mensaje actual
      chatHistory.push({
        role: 'user',
        parts: [{ text: input }]
      });

      // Llamar a Gemini API directamente
      const systemMessage = `Eres un profesor de ESO experto en todas las asignaturas. Responde de forma clara, sencilla y didáctica. Usa ejemplos, analogías y pasos si es necesario. No uses jerga técnica sin explicarla. Si no sabes la respuesta, di que no puedes ayudar con eso.`;
      
      // Agregar instrucción del sistema al primer mensaje
      const contentsWithSystem = [
        {
          role: 'user',
          parts: [{ text: systemMessage }]
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Soy un profesor de ESO experto. Estoy listo para ayudarte con tus dudas.' }]
        },
        ...chatHistory
      ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contentsWithSystem
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la API');
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error('No se recibió respuesta de la IA');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Error en el chat educativo:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Lo siento, hubo un error: ${error.message}. ¿Puedes reformular tu pregunta?` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>📚 Asistente Educativo</h2>
        <p>¡Pregunta cualquier duda de cualquier asignatura!</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: ¿Cómo se resuelve una ecuación de segundo grado?"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export default EducationalChat;