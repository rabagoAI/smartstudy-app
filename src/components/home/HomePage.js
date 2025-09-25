// src/components/home/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import SubjectsSection from './SubjectsSection';
import FeaturesSection from '../common/FeaturesSection';
import Testimonials from '../common/Testimonials';
import AIToolsTeaser from './AIToolsTeaser';
import SEO from '../common/SEO'; // ✅ Importa el componente SEO
import './HomePage.css';

function HomePage() {
  return (
    <>
      <SEO
        title="SmartStudy - Plataforma Educativa con IA"
        description="Mejora tus notas con apuntes organizados, exámenes resueltos y herramientas de IA para estudiantes de ESO."
        image="https://res.cloudinary.com/ds7shn66t/image/upload/v1758619415/Banner_Conceptual_SmartStudy_xc8zaf.jpg"
        url="https://smartstudy.vercel.app"
      />

      <Hero />

      {/* ✅ Eliminado: La sección de CTA con botones de login/register */}
      {/* <section className="home-cta">
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
      </section> */}

      <SubjectsSection />
      <FeaturesSection />
      <AIToolsTeaser />
      <Testimonials />
    </>
  );
}

export default HomePage;