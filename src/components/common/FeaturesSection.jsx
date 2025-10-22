// src/components/common/FlashCard.js
import React, { useState } from 'react';
import './Flashcard.css';

const FlashCard = ({ 
  question, 
  answer, 
  index, 
  isLearned = false,
  onToggleLearned 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localIsLearned, setLocalIsLearned] = useState(isLearned);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleLearned = (e) => {
    e.stopPropagation(); // Evita que se gire la tarjeta al hacer clic en el botón
    
    // Si hay función externa, la usa; si no, maneja el estado localmente
    if (onToggleLearned) {
      onToggleLearned(index);
    } else {
      setLocalIsLearned(!localIsLearned);
    }
  };

  // Usa el estado externo si existe, si no el local
  const currentLearnedState = onToggleLearned ? isLearned : localIsLearned;

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        {/* Frente: Pregunta */}
        <div className="flashcard-front">
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
            <button 
              className={`learned-btn ${currentLearnedState ? 'learned' : ''}`}
              onClick={handleToggleLearned}
              title={currentLearnedState ? "Ya aprendida" : "Marcar como aprendida"}
            >
              {currentLearnedState ? '✅' : '🤔'}
            </button>
          </div>
          <div className="flashcard-content">
            <p>{question}</p>
          </div>
          <div className="flashcard-footer">
            <span>👆 Haz clic para ver la respuesta</span>
          </div>
        </div>

        {/* Dorso: Respuesta */}
        <div className="flashcard-back">
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
            <button 
              className={`learned-btn ${currentLearnedState ? 'learned' : ''}`}
              onClick={handleToggleLearned}
              title={currentLearnedState ? "Ya aprendida" : "Marcar como aprendida"}
            >
              {currentLearnedState ? '✅' : '🤔'}
            </button>
          </div>
          <div className="flashcard-content answer-content">
            <p>{answer}</p>
          </div>
          <div className="flashcard-footer">
            <span>👆 Haz clic para volver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;