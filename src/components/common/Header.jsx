// src/components/common/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Header.css';
import { trackEvent } from '../../analytics';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { currentUser } = useAuth();
    const location = useLocation();

    // Cierra el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cierra el menú al cambiar de ruta
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            trackEvent('auth', 'logout_success', currentUser?.email);
        } catch (error) {
            trackEvent('auth', 'logout_error', error.message);
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Íconos SVG para el menú hamburguesa
    const MenuIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    );

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="header-logo">
                    <Link to="/" className="logo-text">SmartStudIA</Link>
                </div>
                
                {/* Menú de navegación para desktop */}
                <nav className="header-nav desktop-nav">
                    <ul className="nav-links">
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/asignaturas">Asignaturas</Link></li>
                        <li><Link to="/herramientas-ia">Herramientas IA</Link></li>
                        <li><Link to="/mapas-mentales">🧠 Mapas Mentales</Link></li>
                        <li><Link to="/chat-educativo">Chat Educativo</Link></li> 
                    </ul>
                </nav>
                
                {/* Botones de autenticación para desktop */}
                <div className="header-actions desktop-actions">
                    {currentUser ? (
                        <button 
                            className="btn login-btn"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    ) : (
                        <>
                            <Link to="/iniciar-sesion">
                                <button className="btn login-btn">Iniciar Sesión</button>
                            </Link>
                            <Link to="/registrarse">
                                <button className="btn register-btn">Registrarse</button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Botón de menú hamburguesa para móvil */}
                <div className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </div>

                {/* Menú móvil */}
                <nav className={`header-nav mobile-nav ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
                    <ul className="nav-links">
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link></li>
                        <li><Link to="/asignaturas" onClick={() => setIsMenuOpen(false)}>Asignaturas</Link></li>
                        <li><Link to="/herramientas-ia" onClick={() => setIsMenuOpen(false)}>Herramientas IA</Link></li>
                        <li><Link to="/mapas-mentales" onClick={() => setIsMenuOpen(false)}>🧠 Mapas Mentales</Link></li>
                        <li><Link to="/chat-educativo" onClick={() => setIsMenuOpen(false)}>Chat Educativo</Link></li>
                    </ul>
                    
                    {/* Botones de autenticación en menú móvil */}
                    <div className="mobile-actions">
                        {currentUser ? (
                            <button 
                                className="btn login-btn"
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                            >
                                Cerrar Sesión
                            </button>
                        ) : (
                            <>
                                <Link to="/iniciar-sesion" onClick={() => setIsMenuOpen(false)}>
                                    <button className="btn login-btn">Iniciar Sesión</button>
                                </Link>
                                <Link to="/registrarse" onClick={() => setIsMenuOpen(false)}>
                                    <button className="btn register-btn">Registrarse</button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Header;