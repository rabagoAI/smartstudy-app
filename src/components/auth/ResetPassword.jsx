// src/components/auth/ResetPassword.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import './Auth.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Se ha enviado un correo electrónico para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.');
    } catch (error) {
      console.error("Error al restablecer contraseña:", error.message);
      if (error.code === 'auth/user-not-found') {
        setError('No se encontró ninguna cuenta con este correo electrónico.');
      } else {
        setError('Error al enviar el correo de restablecimiento. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>Restablecer Contraseña</h2>
        <form onSubmit={handleReset}>
          {message && <p className="success-message">{message}</p>}
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
          
          <button type="submit" className="btn-primary">Enviar correo de restablecimiento</button>
        </form>
        <p className="auth-footer">
          <Link to="/iniciar-sesion">Volver a Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;