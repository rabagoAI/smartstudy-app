// src/components/common/Flashcard.js
import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ question, answer, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // ✅ Formatear el texto para que se muestre correctamente
  const formatText = (text) => {
    if (!text) return '';
    // Reemplazar saltos de línea por <br />
    return text.replace(/\n/g, '<br />');
  };

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        {/* Frente: Pregunta */}
        <div className="flashcard-front">
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
          </div>
          <div className="flashcard-content">
            <p dangerouslySetInnerHTML={{ __html: formatText(question) }} />
          </div>
          <div className="flashcard-footer">
            <span>👆 Haz clic para ver la respuesta</span>
          </div>
        </div>

        {/* Dorso: Respuesta */}
        <div className="flashcard-back">
          <div className="flashcard-header">
            <span className="card-number">Tarjeta {index + 1}</span>
          </div>
          <div className="flashcard-content answer-content">
            <p dangerouslySetInnerHTML={{ __html: formatText(answer) }} />
          </div>
          <div className="flashcard-footer">
            <span>👆 Haz clic para volver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;