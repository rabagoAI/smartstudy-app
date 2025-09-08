import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="header-logo">
                    {/* Se ha eliminado la imagen del logo y se ha reemplazado con texto */}
                    <Link to="/" className="logo-text">SmartStudy</Link>
                </div>
                
                <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="nav-links">
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/asignaturas">Asignaturas</Link></li>
                        <li><Link to="/herramientas-ia">Herramientas IA</Link></li>
                        {/* Puedes añadir más enlaces aquí si lo necesitas */}
                    </ul>
                </nav>
                
                <div className="header-actions">
                    <button className="btn login-btn">Iniciar Sesión</button>
                    <button className="btn register-btn">Registrarse</button>
                </div>

                <div className="menu-toggle" onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                </div>
            </div>
        </header>
    );
}

export default Header;

