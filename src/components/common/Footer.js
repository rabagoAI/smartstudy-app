import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-column">
          <h3>StudyPal</h3>
          <p>La plataforma de apoyo educativo con tecnología de IA.</p>
        </div>
        {/* Aquí irán más columnas del footer */}
      </div>
      <div className="copyright">
        <p>&copy; 2023 StudyPal - Todos los derechos reservados</p>
      </div>
    </footer>
  );
}

export default Footer;