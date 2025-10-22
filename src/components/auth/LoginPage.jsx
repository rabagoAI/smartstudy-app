// src/components/auth/LoginPage.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("¡Inicio de sesión exitoso!");
      navigate('/');
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      if (error.code === 'auth/invalid-credential') {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      } else {
        setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
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
          
          <button type="submit" className="btn-primary">Iniciar Sesión</button>
        </form>
        <p className="auth-footer">
          ¿No tienes una cuenta? <Link to="/registrarse">Regístrate</Link>
          <br/>
          <Link to="/restablecer-contrasena">¿Olvidaste tu contraseña?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;



