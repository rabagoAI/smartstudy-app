import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-column">
          <h3>SmartStudIA</h3>
          <p>La plataforma de apoyo educativo con tecnología de IA.</p>
        </div>
        <div className="footer-column">
          <h3>Legal</h3>
          <ul>
            <li><Link to="/aviso-legal">Aviso Legal</Link></li>
            <li><Link to="/politica-de-privacidad">Política de Privacidad</Link></li>
            <li><Link to="/politica-de-cookies">Política de Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; 2025 SmartStudIA - Todos los derechos reservados</p>
      </div>
    </footer>
  );
}

export default Footer;