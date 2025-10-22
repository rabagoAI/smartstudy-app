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
            src="https://res.cloudinary.com/ds7shn66t/image/upload/v1759232770/Banner_Producto_del_Dia_Promocion_Cafe_Azul_vi0xs4.jpg" 
            alt="SmartStudy - Aprende de forma inteligente"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;