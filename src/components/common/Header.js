import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; 
import { auth } from '../../firebase'; 
import { signOut } from 'firebase/auth'; 

import './Header.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="header-logo">
                    <Link to="/" className="logo-text">SmartStudy</Link>
                </div>
                
                <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="nav-links">
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/asignaturas">Asignaturas</Link></li>
                        <li><Link to="/herramientas-ia">Herramientas IA</Link></li>
                    </ul>
                </nav>
                
                <div className="header-actions">
                    {/* Renderizado condicional */}
                    {currentUser ? (
                        // Si el usuario está conectado, muestra un enlace al perfil y el botón de Cerrar Sesión
                        <>
                            <Link to="/perfil" className="profile-link">
                                <button className="btn login-btn">Perfil</button>
                            </Link>
                            <button className="btn register-btn" onClick={handleLogout}>
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        // Si el usuario no está conectado, muestra los botones de Iniciar Sesión y Registrarse
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

                <div className="menu-toggle" onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                </div>
            </div>
        </header>
    );
}

export default Header;


