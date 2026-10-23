// src/components/legal/LegalLayout.jsx
// Contenedor común de las páginas legales (Aviso Legal, Privacidad, Cookies).

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Legal.css';

export default function LegalLayout({ title, updatedAt, children }) {
  return (
    <div className="legal-page">
      <Helmet>
        <title>{title} | SmartStudia</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <article className="legal-container">
        <Link to="/" className="legal-back">← Volver a SmartStudia</Link>
        <h1>{title}</h1>
        <p className="legal-updated">Última actualización: {updatedAt}</p>
        {children}
        <nav className="legal-nav" aria-label="Textos legales">
          <Link to="/aviso-legal">Aviso Legal</Link>
          <Link to="/politica-de-privacidad">Política de Privacidad</Link>
          <Link to="/politica-de-cookies">Política de Cookies</Link>
        </nav>
      </article>
    </div>
  );
}
