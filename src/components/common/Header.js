import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          {/* Usar Link en lugar de <a> para navegar en React Router */}
          <Link to="/">
            <i className="fas fa-graduation-cap"></i>
            <span>SmartStudy</span>
          </Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/asignaturas">Asignaturas</Link></li>
            <li><Link to="/herramientas-ia">Herramientas IA</Link></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button className="btn btn-outline">Iniciar Sesión</button>
          <button className="btn btn-primary">Registrarse</button>
        </div>
      </div>
    </header>
  );
}

export default Header;