// src/components/home/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import SubjectsSection from './SubjectsSection';
import FeaturesSection from '../common/FeaturesSection';
import Testimonials from '../common/Testimonials';
import AIToolsTeaser from './AIToolsTeaser';
import './HomePage.css'; // Añadiremos estilos personalizados

function HomePage() {
  return (
    <>
      <Hero />

      {/* ✅ Nueva sección: Llamada a la acción */}
      <section className="home-cta">
        <div className="container">
          <h2>¿Listo para mejorar tus notas?</h2>
          <p>Únete a miles de estudiantes que ya estudian con SmartStudy.</p>
          <div className="cta-buttons">
            <Link to="/iniciar-sesion" className="btn btn-primary">
              Iniciar Sesión
            </Link>
            <Link to="/registrarse" className="btn btn-secondary">
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      <SubjectsSection />
      <FeaturesSection />
      <AIToolsTeaser />
      <Testimonials />
    </>
  );
}

export default HomePage;