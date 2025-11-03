// src/components/ai-tools/FlashcardsGenerator.jsx
// Componente para generar y practicar tarjetas didácticas

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Wand2, Loader, RotateCw, Check, X } from 'lucide-react';
import AIResultDisplay from './AIResultDisplay';
import { trackEvent } from '../../analytics';
import './FlashcardsGenerator.css';

export default function FlashcardsGenerator() {
  const { currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);

  // Generar tarjetas con IA
  const generateFlashcards = async () => {
    if (!input.trim()) {
      setError('Por favor, ingresa un tema para generar tarjetas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      trackEvent('ai_tools', 'generate_flashcards', input);

      // TODO: Reemplaza esto con tu llamada real a la IA
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input })
      });

      if (!response.ok) throw new Error('Error al generar tarjetas');

      const data = await response.json();
      
      // Parsear tarjetas (formato esperado: array de {front, back})
      const parsedFlashcards = Array.isArray(data.flashcards) 
        ? data.flashcards 
        : parseFlashcardsFromText(data.result);
      
      setFlashcards(parsedFlashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCorrectCount(0);
      setPracticeMode(false);

      // Guardar en Firestore
      if (currentUser) {
        await addDoc(
          collection(db, 'users', currentUser.uid, 'ai_history'),
          {
            tool: 'flashcards',
            title: `Tarjetas: ${input}`,
            prompt: input,
            response: JSON.stringify(parsedFlashcards),
            timestamp: serverTimestamp()
          }
        );
      }
    } catch (err) {
      console.error('Error generando tarjetas:', err);
      setError('No se pudo generar las tarjetas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Parsear tarjetas del formato de texto
  const parseFlashcardsFromText = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const cards = [];
    
    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        cards.push({
          front: lines[i].replace(/^[\d\.\-\*]\s*/, '').trim(),
          back: lines[i + 1].replace(/^[\d\.\-\*]\s*/, '').trim()
        });
      }
    }
    
    return cards.length > 0 ? cards : [{ front: 'Pregunta', back: 'Respuesta' }];
  };

  // Navegar entre tarjetas
  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Modo práctica
  const markAsCorrect = () => {
    setCorrectCount(correctCount + 1);
    nextCard();
  };

  const resetPractice = () => {
    setCorrectCount(0);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPracticeMode(false);
  };

  // Exportar tarjetas
  const exportFlashcards = () => {
    const text = flashcards
      .map((card, i) => `${i + 1}. Q: ${card.front}\nA: ${card.back}`)
      .join('\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tarjetas-${input}-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (flashcards.length === 0) {
    return (
      <div className="flashcards-container">
        <div className="flashcards-input-section">
          <h2 className="tool-title">Genera Tarjetas Didácticas</h2>
          <p className="tool-description">
            La IA creará tarjetas de estudio automáticamente basadas en tu tema
          </p>

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError('')} className="close-error">×</button>
            </div>
          )}

          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Tabla periódica, Revolución Industrial, Verbos irregulares en inglés..."
              className="tool-input"
              rows={4}
            />
            <div className="char-count">{input.length}/500</div>
          </div>

          <button
            onClick={generateFlashcards}
            disabled={loading || !input.trim()}
            className="btn btn-primary btn-generate"
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                Generando tarjetas...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generar Tarjetas
              </>
            )}
          </button>

          <div className="flashcards-info">
            <h3>💡 Cómo funcionan las tarjetas didácticas</h3>
            <ul>
              <li>✓ Perfecto para memorizar conceptos</li>
              <li>✓ Modo práctica para autoevaluarte</li>
              <li>✓ Exporta tus tarjetas en cualquier momento</li>
              <li>✓ Todas tus tarjetas se guardan automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Modo visualización / práctica
  if (!practiceMode) {
    return (
      <div className="flashcards-container">
        <div className="flashcards-header">
          <h2>Tarjetas Didácticas: {input}</h2>
          <p>{flashcards.length} tarjetas generadas</p>
        </div>

        <div className="flashcards-display">
          <div className="card-counter">
            Tarjeta {currentIndex + 1} de {flashcards.length}
          </div>

          <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-label">Pregunta</div>
                <div className="card-content">{flashcards[currentIndex].front}</div>
              </div>
              <div className="card-back">
                <div className="card-label">Respuesta</div>
                <div className="card-content">{flashcards[currentIndex].back}</div>
              </div>
            </div>
          </div>

          <div className="card-hint">
            👆 Haz clic en la tarjeta para voltearla
          </div>
        </div>

        <div className="flashcards-controls">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="btn btn-secondary"
          >
            ← Anterior
          </button>

          <button
            onClick={() => setPracticeMode(true)}
            className="btn btn-primary"
          >
            Modo Práctica
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            className="btn btn-secondary"
          >
            Siguiente →
          </button>
        </div>

        <div className="flashcards-actions">
          <button onClick={exportFlashcards} className="btn btn-outline">
            📥 Descargar Tarjetas
          </button>
          <button 
            onClick={() => {
              setFlashcards([]);
              setInput('');
            }} 
            className="btn btn-outline"
          >
            ↻ Generar Nuevas
          </button>
        </div>
      </div>
    );
  }

  // Modo práctica
  return (
    <div className="flashcards-container">
      <div className="flashcards-header">
        <h2>Modo Práctica</h2>
        <p>Responde cada pregunta correctamente o incorrectamente</p>
      </div>

      <div className="practice-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(correctCount / flashcards.length) * 100}%` }}
          />
        </div>
        <p className="progress-text">
          {correctCount} de {flashcards.length} correctas ({Math.round((correctCount / flashcards.length) * 100)}%)
        </p>
      </div>

      <div className="flashcards-display">
        <div className="card-counter">
          Tarjeta {currentIndex + 1} de {flashcards.length}
        </div>

        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="card-inner">
            <div className="card-front">
              <div className="card-label">Pregunta</div>
              <div className="card-content">{flashcards[currentIndex].front}</div>
            </div>
            <div className="card-back">
              <div className="card-label">Respuesta</div>
              <div className="card-content">{flashcards[currentIndex].back}</div>
            </div>
          </div>
        </div>

        <div className="card-hint">
          👆 Haz clic para ver la respuesta
        </div>
      </div>

      {isFlipped && (
        <div className="practice-buttons">
          <button
            onClick={() => {
              nextCard();
              setIsFlipped(false);
            }}
            className="btn btn-danger"
          >
            <X size={18} /> Incorrecta
          </button>

          <button
            onClick={markAsCorrect}
            className="btn btn-success"
          >
            <Check size={18} /> Correcta
          </button>
        </div>
      )}

      {currentIndex === flashcards.length - 1 && isFlipped && (
        <div className="practice-summary">
          <h3>¡Práctica completada!</h3>
          <p className="final-score">
            Acertaste {correctCount} de {flashcards.length} ({Math.round((correctCount / flashcards.length) * 100)}%)
          </p>
          <button onClick={resetPractice} className="btn btn-primary btn-large">
            <RotateCw size={18} /> Volver a intentar
          </button>
        </div>
      )}

      <div className="flashcards-actions">
        <button onClick={resetPractice} className="btn btn-outline">
          ← Volver a Visualizar
        </button>
      </div>
    </div>
  );
}
