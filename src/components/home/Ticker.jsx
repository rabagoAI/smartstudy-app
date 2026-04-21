// src/components/home/Ticker.jsx
import React from 'react';
import './Ticker.css';

function Ticker() {
  const tickerItems = [
    "Lengua Española",
    "Matemáticas",
    "Biología",
    "Geografía",
    "Inglés",
    "Tecnología",
    "Historia",
    "Física"
  ];

  return (
    <div className="ticker">
      <div className="ticker-inner">
        {/* Duplicamos los items para el efecto infinito */}
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="ticker-item">
            {item}
            <span className="ticker-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
