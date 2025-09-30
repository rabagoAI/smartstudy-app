// src/components/home/Hero.js
import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          {/* Imagen de fondo */}
          <img 
            src="https://res.cloudinary.com/ds7shn66t/image/upload/v1759222816/Banner_SmartStudIA_Proporci%C3%B3n_Correcta_juzbkc.jpg" 
            alt="SmartStudy - Aprende de forma inteligente"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;