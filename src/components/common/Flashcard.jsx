// src/components/common/FlashCard.js
import React, { useState } from 'react';
import './Flashcard.css';

const FlashCard = ({
  question,
  answer,
  index,
  isLearned = false,
  onToggleLearned,
  onNext, // Nuevo prop
  onPrev  // Nuevo prop
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // -- Lógica de Teclado --
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight' && onNext) {
      onNext();
    } else if (e.key === 'ArrowLeft' && onPrev) {
      onPrev();
    }
  };

  // -- Lógica de Swipe Móvil --
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onNext) onNext();
    if (isRightSwipe && onPrev) onPrev();
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleLearned = (e) => {
    e.stopPropagation();
    if (onToggleLearned) {
      onToggleLearned(index);
    }
  };

  return (
    <div
      className="flashcard-container"
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex="0"
      role="button"
      aria-label={`Tarjeta ${index + 1}: ${isFlipped ? 'Respuesta' : 'Pregunta'}. Pulsa Espacio para girar.`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        {/* Frente: Pregunta */}
        <div className="flashcard-front" aria-hidden={isFlipped}>
          {/* ... contenido existente ... */}
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
            <button
              className={`learned-btn ${isLearned ? 'learned' : ''}`}
              onClick={handleToggleLearned}
              title={isLearned ? "Ya aprendida" : "Marcar como aprendida"}
              aria-label={isLearned ? "Marcar como no aprendida" : "Marcar como aprendida"}
            >
              {isLearned ? '✅' : '🤔'}
            </button>
          </div>
          <div className="flashcard-content">
            <p>{question}</p>
          </div>
          <div className="flashcard-footer">
            <span aria-hidden="true">👆 Haz clic o presiona Espacio para ver</span>
          </div>
        </div>

        {/* Dorso: Respuesta */}
        <div className="flashcard-back" aria-hidden={!isFlipped}>
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
            <button
              className={`learned-btn ${isLearned ? 'learned' : ''}`}
              onClick={handleToggleLearned}
              title={isLearned ? "Ya aprendida" : "Marcar como aprendida"}
            >
              {isLearned ? '✅' : '🤔'}
            </button>
          </div>
          <div className="flashcard-content answer-content">
            <p>{answer}</p>
          </div>
          <div className="flashcard-footer">
            <span aria-hidden="true">👆 Haz clic o presiona Espacio para volver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;