import React from 'react';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>La plataforma de apoyo educativo para estudiantes de ESO</h1>
          <p>Encuentra recursos, apuntes y ayuda para todas tus asignaturas de 1º de la ESO</p>
          <div className="search-box">
            <input type="text" placeholder="Buscar apuntes, exámenes o temas..." />
            <button><i className="fas fa-search"></i></button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;