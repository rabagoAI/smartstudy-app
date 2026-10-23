// src/components/auth/RegisterPage.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css'; // Asegúrate de que esta ruta sea correcta

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // RGPD: el registro exige aceptar expresamente la Política de Privacidad
    if (!acceptedPrivacy) {
      setError('Debes aceptar la Política de Privacidad para crear tu cuenta.');
      return;
    }

    try {
      await signup(email, password, '');

      sessionStorage.setItem('newUserRegistration', 'true');
      navigate('/');

    } catch (error) {
      console.error("Error al registrar:", error.message);
      if (error.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError('Error al registrar. Por favor, revisa tus datos e inténtalo más tarde.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>Registrarse</h2>
        <form onSubmit={handleRegister}>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Primera capa informativa (art. 13 RGPD) */}
          <p className="privacy-first-layer">
            <strong>Responsable:</strong> SmartStudia. <strong>Finalidad:</strong> crear y gestionar tu cuenta
            y prestarte el servicio. <strong>Derechos:</strong> acceso, rectificación, supresión y otros, como
            se explica en la{' '}
            <Link to="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</Link>.
          </p>
          <label className="privacy-checkbox">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              required
            />
            <span>
              He leído y acepto la{' '}
              <Link to="/politica-de-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</Link>
              {' '}y el{' '}
              <Link to="/aviso-legal" target="_blank" rel="noopener noreferrer">Aviso Legal</Link>.
            </span>
          </label>

          <button type="submit" className="btn-primary">Registrarse</button>
        </form>
        <p className="auth-footer">
          ¿Ya tienes una cuenta? <Link to="/iniciar-sesion">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;