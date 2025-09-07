import React from 'react';
import { Link } from 'react-router-dom';

function FeaturesSection() {
  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">¿Por qué usar nuestra plataforma?</h2>
        <div className="features-grid">
          <div className="feature">
            <i className="fas fa-book-open"></i>
            <h3>Apuntes Organizados</h3>
            <p>Encuentra apuntes claros y bien estructurados para cada asignatura.</p>
          </div>
          <div className="feature">
            <i className="fas fa-check-circle"></i>
            <h3>Exámenes Resueltos</h3>
            <p>Practica con exámenes de años anteriores y comprueba tus respuestas.</p>
          </div>
          <div className="feature">
            <i className="fas fa-users"></i>
            <h3>Comunidad Activa</h3>
            <p>Resuelve dudas con otros estudiantes y profesores de la comunidad.</p>
          </div>
          <div className="feature">
            <i className="fas fa-video"></i>
            <h3>Videotutoriales</h3>
            <p>Aprende con videos explicativos de los conceptos más difíciles.</p>
          </div>
          <div className="feature">
            <i className="fas fa-mobile-alt"></i>
            <h3>Acceso Móvil</h3>
            <p>Estudia desde cualquier dispositivo, en cualquier momento.</p>
          </div>
          <div className="feature">
            <i className="fas fa-graduation-cap"></i>
            <h3>Preparación Eficaz</h3>
            <p>Mejora tus notas con nuestros métodos de estudio probados.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;