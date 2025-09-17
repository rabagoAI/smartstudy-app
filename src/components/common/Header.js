// src/components/common/Header.js

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ Importa el contexto de autenticación
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // ✅ Importa la instancia de auth
import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const authContext = useAuth();
const { currentUser } = authContext || { currentUser: null };

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

    // ✅ Función para cerrar sesión
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Firebase + AuthContext se encargan del resto
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="header-logo">
                    <Link to="/" className="logo-text">SmartStudy</Link>
                </div>
                
                <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
                    <ul className="nav-links">
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link></li>
                        <li><Link to="/asignaturas" onClick={() => setIsMenuOpen(false)}>Asignaturas</Link></li>
                        <li><Link to="/herramientas-ia" onClick={() => setIsMenuOpen(false)}>Herramientas IA</Link></li>
                    </ul>
                </nav>
                
                <div className="header-actions">
                    {currentUser ? (
                        // ✅ Usuario logueado: muestra botón de cerrar sesión
                        <button 
                            className="btn login-btn"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    ) : (
                        // ✅ Usuario no logueado: muestra botones de login/register
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

                <div className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>
            </div>
        </header>
    );
}

export default Header;