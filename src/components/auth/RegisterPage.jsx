// src/components/auth/RegisterPage.js

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; // Asegúrate de que esta ruta sea correcta

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      // 🎯 LÍNEA CRÍTICA - Marcar como nuevo usuario registrado para activar el tour
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