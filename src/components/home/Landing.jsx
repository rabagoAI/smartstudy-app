// src/components/home/Landing.jsx - VERSIÓN MEJORADA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, MessageSquare, BarChart3, Play, Zap, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // ✅ Import correcto
import { getAuthErrorMessage } from '../../utils/errorHandler'; // ✅ Error handling mejorado
import './Landing.css';
import { trackEvent } from '../../analytics';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser, signup, login } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya está logueado, redirigir a dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      // Si funciona, AuthContext redirige automáticamente
      navigate('/home');
      setShowForm(false);
    } catch (err) {
      trackEvent('auth', 'error', err.code);
      // Usa el error handler mejorado
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = (isLoginMode = false) => {
    trackEvent(
      'landing',
      'click_cta',
      isLoginMode ? 'login_button' : 'signup_button'
    );
    setShowForm(true);
    setIsLogin(isLoginMode);
    setFormData({ email: '', password: '', name: '' });
    setError('');
  };

  return (
    <div className="landing">
      {/* Header/Nav */}
      <header className="landing-header">
        <div className="landing-container header-content">
          <div className="logo-section">
            <Brain className="logo-icon" />
            <span className="logo-text">SmartStudia</span>
          </div>
          <button 
            onClick={() => openAuthModal(true)}
            className="btn-header"
          >
            Acceder
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="landing-container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Estudia más <span className="highlight">inteligente</span>, no más duro
            </h1>
            <p className="hero-subtitle">
              Todo lo que necesitas para dominar cada tema: resúmenes, exámenes, vídeos y herramientas IA. Todo en un solo lugar.
            </p>
            <div className="hero-buttons">
              <button 
                onClick={() => openAuthModal(false)}
                className="btn btn-primary"
              >
                Empezar Gratis <ArrowRight className="btn-icon" />
              </button>
              <button className="btn btn-secondary">
                Ver demo
              </button>
            </div>
            <p className="hero-notes">✓ Sin tarjeta requerida • ✓ Acceso inmediato</p>
          </div>
        </div>
      </section>

      {/* Problema + Solución */}
      <section className="problem-solution">
        <div className="landing-container">
          <h2 className="section-title">El problema del estudio tradicional</h2>
          <div className="problems-grid">
            <div className="problem-card">
              <p className="problem-icon">📚</p>
              <p className="problem-title">Libros desorganizados</p>
              <p className="problem-desc">Información dispersa, difícil de entender, sin ejercicios prácticos.</p>
            </div>
            <div className="problem-card">
              <p className="problem-icon">⏱️</p>
              <p className="problem-title">Tiempo desperdiciado</p>
              <p className="problem-desc">Buscar vídeos, encontrar exámenes, organizar apuntes... agotador.</p>
            </div>
            <div className="problem-card">
              <p className="problem-icon">❌</p>
              <p className="problem-title">Sin ayuda personalizada</p>
              <p className="problem-desc">Dudas sin respuesta, ejercicios sin soluciones claras.</p>
            </div>
          </div>

          <div className="solution-box">
            <h3 className="solution-title">✨ La solución: SmartStudia</h3>
            <div className="solution-grid">
              <div className="solution-item">
                <Check className="check-icon" />
                <div>
                  <p className="solution-item-title">Resúmenes claros y concisos</p>
                  <p className="solution-item-desc">Lo esencial de cada tema en una página</p>
                </div>
              </div>
              <div className="solution-item">
                <Check className="check-icon" />
                <div>
                  <p className="solution-item-title">Vídeos explicativos</p>
                  <p className="solution-item-desc">Entiende cada concepto paso a paso</p>
                </div>
              </div>
              <div className="solution-item">
                <Check className="check-icon" />
                <div>
                  <p className="solution-item-title">Exámenes resueltos</p>
                  <p className="solution-item-desc">Practica y ve las soluciones explicadas</p>
                </div>
              </div>
              <div className="solution-item">
                <Check className="check-icon" />
                <div>
                  <p className="solution-item-title">Herramientas IA gratis</p>
                  <p className="solution-item-desc">Genera tarjetas y exámenes personalizados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="landing-container">
          <h2 className="section-title">Todo lo que necesitas para triunfar</h2>
          <div className="features-grid">
            <div className="feature-card">
              <BookOpen className="feature-icon" />
              <h3 className="feature-title">Resúmenes claros</h3>
              <p className="feature-desc">Cada tema resumido de forma comprensible, sin demasiadas palabras.</p>
            </div>
            <div className="feature-card">
              <Play className="feature-icon" />
              <h3 className="feature-title">Vídeos explicativos</h3>
              <p className="feature-desc">Aprende viendo explicaciones claras y visuales de cada concepto.</p>
            </div>
            <div className="feature-card">
              <BarChart3 className="feature-icon" />
              <h3 className="feature-title">Exámenes resueltos</h3>
              <p className="feature-desc">Practica con exámenes reales y ve las soluciones explicadas.</p>
            </div>
            <div className="feature-card">
              <Brain className="feature-icon" />
              <h3 className="feature-title">IA que genera tarjetas</h3>
              <p className="feature-desc">Crea tarjetas didácticas automáticamente para memorizar.</p>
            </div>
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h3 className="feature-title">Exámenes por IA</h3>
              <p className="feature-desc">Genera exámenes personalizados para practicar cuantas veces quieras.</p>
            </div>
            <div className="feature-card">
              <MessageSquare className="feature-icon" />
              <h3 className="feature-title">Consultas con IA</h3>
              <p className="feature-desc">Haz preguntas sobre cualquier tema y obtén respuestas al instante.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Asignaturas */}
      <section className="subjects">
        <div className="landing-container">
          <h2 className="section-title">Asignaturas disponibles</h2>
          <div className="subjects-grid">
            {['Matemáticas', 'Lengua y Literatura', 'Biología y Geología', 'Geografía e Historia', 'Inglés'].map((subject) => (
              <div key={subject} className="subject-badge">
                {subject}
              </div>
            ))}
          </div>
          <p className="subjects-note">Ampliando a más cursos y asignaturas próximamente</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <div className="landing-container">
          <h2 className="section-title">Acceso sin sorpresas</h2>
          <div className="pricing-grid">
            <div className="pricing-card free">
              <p className="pricing-icon">🎓</p>
              <p className="pricing-label">Herramientas IA</p>
              <p className="pricing-price">Gratis</p>
              <ul className="pricing-features">
                <li>
                  <Check className="check-sm" />
                  <span>Generador de tarjetas</span>
                </li>
                <li>
                  <Check className="check-sm" />
                  <span>Exámenes personalizados</span>
                </li>
                <li>
                  <Check className="check-sm" />
                  <span>Chat con IA</span>
                </li>
              </ul>
            </div>
            <div className="pricing-card premium">
              <p className="pricing-icon">📖</p>
              <p className="pricing-label">Contenidos Premium</p>
              <p className="pricing-price">4,99€/mes</p>
              <ul className="pricing-features">
                <li>
                  <Check className="check-sm" />
                  <span>Resúmenes completos</span>
                </li>
                <li>
                  <Check className="check-sm" />
                  <span>Vídeos explicativos</span>
                </li>
                <li>
                  <Check className="check-sm" />
                  <span>Exámenes resueltos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final">
        <div className="landing-container">
          <h2 className="cta-title">¿Listo para estudiar de forma inteligente?</h2>
          <p className="cta-subtitle">Únete a estudiantes que ya están mejorando sus calificaciones</p>
          <button 
            onClick={() => openAuthModal(false)}
            className="btn btn-cta"
          >
            Registrarse Ahora <ArrowRight className="btn-icon" />
          </button>
          <p className="cta-notes">✓ Acceso inmediato • ✓ Sin tarjeta de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p className="footer-text">© 2025 SmartStudia. Todos los derechos reservados.</p>
          <p className="footer-tagline">Estudia inteligente, no duro.</p>
        </div>
      </footer>

      {/* Modal Autenticación */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close" aria-label="Cerrar modal">
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {!isLogin && (
                <input 
                  type="text" 
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              )}
              <input 
                type="email" 
                name="email"
                placeholder="Tu email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <input 
                type="password" 
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                required
                minLength="6"
              />

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                {loading ? 'Procesando...' : (isLogin ? 'Inicia sesión' : 'Registrarse')}
              </button>
            </form>

            <div className="modal-toggle">
              <p className="toggle-text">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({ email: '', password: '', name: '' });
                  }}
                  className="toggle-btn"
                  type="button"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            <p className="modal-terms">
              Al registrarte, aceptas nuestros términos de servicio
            </p>
          </div>
        </div>
      )}
    </div>
  );
}