import React from 'react';
import { Link } from 'react-router-dom';

function AIToolsTeaser() {
  return (
    <section className="ai-tools-teaser">
      <div className="container">
        <h2 className="section-title">Potencia tu estudio con Inteligencia Artificial</h2>
        <p>Sube tus apuntes y deja que la IA te ayude a resumir, crear exámenes y generar mapas mentales.</p>
        <Link to="/herramientas-ia" className="btn btn-primary">
          Descubre las herramientas IA
        </Link>
      </div>
    </section>
  );
}

export default AIToolsTeaser;