// src/components/ai-tools/MindMapGenerator.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useRateLimit from '../../hooks/useRateLimit';
import RateLimitIndicator from '../common/RateLimitIndicator';
import mermaid from 'mermaid';
import './MindMapGenerator.css';

// Lista de temas predefinidos
const PREDEFINED_TOPICS = [
  { id: 'biologia', name: 'Biología', icon: 'fas fa-dna' },
  { id: 'matematicas', name: 'Matemáticas', icon: 'fas fa-calculator' },
  { id: 'historia', name: 'Historia', icon: 'fas fa-book' },
  { id: 'quimica', name: 'Química', icon: 'fas fa-flask' },
  { id: 'fisica', name: 'Física', icon: 'fas fa-atom' },
  { id: 'literatura', name: 'Literatura', icon: 'fas fa-pen-fancy' },
  { id: 'geografia', name: 'Geografía', icon: 'fas fa-globe' },
  { id: 'ingles', name: 'Inglés', icon: 'fas fa-language' },
];

function MindMapGenerator() {
  const { currentUser } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mermaidError, setMermaidError] = useState('');

  // Rate limiting
  const rateLimit = useRateLimit(currentUser, false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      mindmap: {
        padding: 20,
        maxNodeWidth: 200,
      },
    });
  }, []);

  const generateMindMap = async () => {
    setError('');
    setMermaidError('');

    const topic = customTopic.trim() || selectedTopic;

    if (!topic) {
      setError('Por favor, selecciona o escribe un tema.');
      return;
    }

    // Verificar rate limiting
    const rateLimitCheck = await rateLimit.checkLimit();
    if (!rateLimitCheck.allowed) {
      setError(`⏱️ ${rateLimitCheck.error}`);
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `Crea un mapa mental sobre "${topic}" en formato Mermaid mindmap.

IMPORTANTE: Devuelve SOLO el código Mermaid válido, sin explicaciones ni comillas.

Formato esperado:
mindmap
  root((Tema Principal))
    Rama 1
      Surama 1.1
      Surama 1.2
    Rama 2
      Surama 2.1
      Surama 2.2
    Rama 3
      Surama 3.1

Requisitos:
- Máximo 5 ramas principales
- Máximo 4 subramas por rama
- Contenido educativo y relevante
- Texto conciso y claro
- Estructura jerárquica clara

Devuelve SOLO el código Mermaid mindmap:`;

      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 429) {
          throw new Error(errData.error || 'Límite de uso alcanzado. Espera un momento.');
        }
        throw new Error(errData.error?.message || `Error API (${response.status})`);
      }

      const data = await response.json();
      let generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!generatedCode) throw new Error('Respuesta vacía de Gemini');

      // Limpiar la respuesta si viene con markdown
      if (generatedCode.includes('```')) {
        generatedCode = generatedCode
          .replace(/```mermaid\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }

      // Validar que empiece con "mindmap"
      if (!generatedCode.startsWith('mindmap')) {
        generatedCode = 'mindmap\n' + generatedCode;
      }

      console.log('Código Mermaid generado:', generatedCode);

      setMermaidCode(generatedCode);

      // Incrementar contador de uso
      await rateLimit.incrementCount();

      // Renderizar con Mermaid
      setTimeout(() => {
        mermaid.contentLoaded();
      }, 100);

    } catch (err) {
      console.error('Error al generar mapa mental:', err);
      setError(`Error: ${err.message || 'No se pudo generar el mapa mental.'}`);
      setMermaidCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMindMap = () => {
    if (!mermaidCode) return;

    const element = document.createElement('a');
    const file = new Blob([mermaidCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `mapa-mental-${Date.now()}.mmd`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async () => {
    if (!mermaidCode) return;
    try {
      await navigator.clipboard.writeText(mermaidCode);
      alert('¡Código copiado al portapapeles!');
    } catch (err) {
      alert('No se pudo copiar el código.');
    }
  };

  return (
    <>
      <section className="mindmap-hero">
        <div className="container">
          <h1>🧠 Generador de Mapas Mentales</h1>
          <p>Crea mapas mentales automáticos con IA para cualquier tema</p>
        </div>
      </section>

      <section className="mindmap-container">
        <div className="container">
          {/* Rate Limit Indicator - Comentado temporalmente */}
          {/* <RateLimitIndicator rateLimit={rateLimit} /> */}

          {/* Input Section */}
          <div className="mindmap-input-section">
            <h2>Genera tu Mapa Mental</h2>

            {/* Temas predefinidos */}
            <div className="topics-grid">
              {PREDEFINED_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  className={`topic-btn ${selectedTopic === topic.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setCustomTopic('');
                    setMermaidCode('');
                  }}
                >
                  <i className={topic.icon}></i>
                  <span>{topic.name}</span>
                </button>
              ))}
            </div>

            {/* Custom topic input */}
            <div className="custom-topic">
              <label>O escribe tu propio tema:</label>
              <input
                type="text"
                placeholder="Ej: Fotosíntesis, Revolución Francesa, Geometría..."
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  setSelectedTopic('');
                }}
                className="topic-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Generate Button */}
            <button
              className="btn btn-primary generate-btn"
              onClick={generateMindMap}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Generando Mapa...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  Generar Mapa Mental
                </>
              )}
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="generating-message">
              <div className="spinner-large"></div>
              <p>Estamos creando tu mapa mental con IA...</p>
              <p className="tip">💡 Esto puede tardar unos segundos.</p>
            </div>
          )}

          {/* Mermaid Render Section */}
          {mermaidCode && (
            <div className="mindmap-result">
              <div className="mindmap-header">
                <h2>Tu Mapa Mental</h2>
                <div className="mindmap-actions">
                  <button
                    className="btn btn-outline copy-btn"
                    onClick={copyToClipboard}
                    title="Copiar código"
                  >
                    <i className="fas fa-copy"></i> Copiar Código
                  </button>
                  <button
                    className="btn btn-outline download-btn"
                    onClick={downloadMindMap}
                    title="Descargar archivo"
                  >
                    <i className="fas fa-download"></i> Descargar
                  </button>
                </div>
              </div>

              <div className="mermaid-container">
                <div className="mermaid">
                  {mermaidCode}
                </div>
              </div>

              {/* Info */}
              <div className="mindmap-info">
                <p>💡 Puedes copiar el código y editarlo en <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer">Mermaid Live</a></p>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!mermaidCode && (
            <div className="mindmap-tips">
              <h3>💡 Consejos</h3>
              <ul>
                <li>✅ Selecciona un tema predefinido o escribe uno personalizado</li>
                <li>✅ Genera mapas mentales para cualquier asignatura</li>
                <li>✅ Descarga el código para editarlo después</li>
                <li>✅ Usa para estudiar, resumir o planificar proyectos</li>
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default MindMapGenerator;