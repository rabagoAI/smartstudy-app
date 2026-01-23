// src/components/ai-tools/EducationalChat.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Trash2, Cloud, CloudOff, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useRateLimit from '../../hooks/useRateLimit';
import RateLimitIndicator from '../common/RateLimitIndicator';
import { db } from '../../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import './EducationalChat.css';

const EducationalChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Session ID único por carga de página
  const sessionIdRef = useRef(Date.now().toString());
  const messagesEndRef = useRef(null);

  const { currentUser } = useAuth();
  const apiKey = import.meta.env.VITE_APP_GEMINI_API_KEY;

  // Rate limiting hook
  const rateLimit = useRateLimit(currentUser, false);

  const SUGGESTED_PROMPTS = [
    "📝 Resúmeme este tema...",
    "🧪 Explícame la fotosíntesis",
    "🧮 Ayúdame con una ecuación",
    "📅 Hazme un plan de estudio",
    "🌍 Capitales de Europa",
    "✍️ Corrige mi redacción"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [sessionTimestamp, setSessionTimestamp] = useState(Date.now());

  // ✅ Persistencia: Listener en tiempo real
  useEffect(() => {
    if (!currentUser) return;
    setError(null);

    const messagesRef = collection(db, 'users', currentUser.uid, 'educational_chat');

    // FIX PROVISIONAL: Quitamos el 'where' para evitar el error de "Index Required"
    // Traemos todo y filtramos en cliente (RAM).
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      // 1. Mapear todos los docs
      const allMsgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Filtrar SOLO los de esta sesión
      const sessionMsgs = allMsgs.filter(msg => msg.sessionId === sessionIdRef.current);

      setMessages(sessionMsgs);

      // Chequear si hay escrituras pendientes
      setIsSyncing(snapshot.metadata.hasPendingWrites);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError(`Error cargando historial: ${err.message}`);
    });

    return () => unsubscribe();
  }, [currentUser, sessionTimestamp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleCopy = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (text) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "respuesta_educativa.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewChat = () => {
    if (messages.length > 0 && !window.confirm("¿Empezar un chat nuevo?")) return;

    sessionIdRef.current = Date.now().toString();
    setMessages([]);
    setInput('');
    setError(null);
    setSearchTerm('');
    setSessionTimestamp(Date.now());
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const rateLimitCheck = await rateLimit.checkLimit();
    if (!rateLimitCheck.allowed) { alert(`⏱️ ${rateLimitCheck.error}`); return; }
    if (!apiKey) { alert('Error: Clave API de Gemini no configurada.'); return; }

    if (!textOverride) setInput('');
    setIsLoading(true);

    try {
      const messagesRef = collection(db, 'users', currentUser.uid, 'educational_chat');
      const currentSessionId = sessionIdRef.current;

      // 1. Guardar mensaje usuario
      await addDoc(messagesRef, {
        role: 'user',
        content: textToSend,
        sessionId: currentSessionId,
        createdAt: serverTimestamp()
      });

      // 2. Construir historial saneado
      // Excluir mensajes vacíos o corruptos para evitar error 500
      const validMessages = messages.filter(m => m.content && typeof m.content === 'string');

      const chatHistory = validMessages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Añadir el actual
      chatHistory.push({ role: 'user', parts: [{ text: textToSend }] });

      const systemMessage = `Eres un profesor de ESO experto. Responde en Markdown rico.`;

      const contentsWithSystem = [
        { role: 'user', parts: [{ text: systemMessage }] },
        { role: 'model', parts: [{ text: 'Entendido.' }] },
        ...chatHistory
      ];

      const requestBody = { contents: contentsWithSystem };

      // 3. API Call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error API (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) throw new Error('Respuesta vacía de Gemini');

      // 4. Guardar respuesta
      await addDoc(messagesRef, {
        role: 'assistant',
        content: reply,
        sessionId: currentSessionId,
        createdAt: serverTimestamp()
      });

      await rateLimit.incrementCount();
    } catch (error) {
      console.error('Error handling send:', error);
      setError("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      {/* Header Premium */}
      <div className="chat-header-premium">
        <div className="header-left">
          <div className="icon-wrapper">📚</div>
          <div>
            <h2>Asistente Educativo</h2>
            <div className="status-badge">
              {isSyncing ? <span style={{ color: '#f57c00' }}>☁️ Guardando...</span> : <span style={{ color: '#4caf50' }}>✨ Conectado</span>}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={handleNewChat} className="new-chat-btn">
            <span>+ Nuevo Chat</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ef9a9a',
          whiteSpace: 'pre-wrap'
        }}>
          {error}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <h3>¿Qué quieres aprender hoy?</h3>
            <p>Elige una sugerencia o escribe tu duda abajo.</p>
            <div className="suggestions-grid">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button key={idx} onClick={() => handleSend(prompt)} className="suggestion-chip">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMessages.map((msg) => (
          <div key={msg.id || Math.random()} className={`message ${msg.role}`}>
            <div className="message-content">
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ p: ({ node, ...props }) => <p style={{ margin: '0 0 8px 0' }} {...props} /> }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {(msg.role === 'assistant' || msg.role === 'model') && (
                <div className="message-actions">
                  <button onClick={() => handleCopy(msg.content, msg.id)} title="Copiar">
                    {copiedId === msg.id ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDownload(msg.content)} title="Descargar">
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda aquí..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(null))}
          disabled={isLoading}
          style={{
            flex: 1, padding: '16px', border: '2px solid #e9ecef', borderRadius: '16px',
            resize: 'none', minHeight: '60px', outline: 'none', fontFamily: 'inherit'
          }}
        />
        <button
          onClick={() => handleSend(null)}
          disabled={isLoading || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #4361ee, #3a0ca3)',
            color: 'white', border: 'none', borderRadius: '16px', padding: '0 24px',
            fontWeight: '600', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.7 : 1
          }}
        >
          {isLoading ? '...' : 'Enviar'}
        </button>
      </div>

      {currentUser && (
        <div style={{ marginTop: '10px', padding: '0 10px' }}>
          <RateLimitIndicator
            remainingCallsMinute={rateLimit.remainingCallsMinute}
            remainingCallsHour={rateLimit.remainingCallsHour}
            limits={rateLimit.limits}
            nextResetMinute={rateLimit.nextResetMinute}
            isPremium={false}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default EducationalChat;