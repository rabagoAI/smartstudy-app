import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    text: "Antes suspendía mates todos los trimestres. Con SmartStudIA entiendo los problemas paso a paso y ahora tengo un 8. ¡No me lo podía creer!",
    name: "Alba García",
    grade: "2° ESO · Madrid",
    initials: "AG",
    grad: "linear-gradient(135deg, #7c3aed, #2563eb)",
    stars: 5,
    badge: "⭐ Top Review"
  },
  {
    text: "El tutor de inglés IA es increíble. Practico conversación cuando quiero, sin vergüenza. He pasado de un B1 a casi B2 en tres meses.",
    name: "Javier Molina",
    grade: "3° ESO · Barcelona",
    initials: "JM",
    grad: "linear-gradient(135deg, #0ea5e9, #10b981)",
    stars: 5,
    badge: null
  },
  {
    text: "Me ayuda a resumir los temas de Historia y hacer esquemas. Estudio el doble de rápido y me queda tiempo para mis hobbies.",
    name: "Lucía Fernández",
    grade: "1° ESO · Sevilla",
    initials: "LF",
    grad: "linear-gradient(135deg, #ec4899, #f59e0b)",
    stars: 5,
    badge: null
  }
];

function TestiCard({ t, idx }) {
  const offset = idx === 1 ? -16 : 0;

  return (
    <div className="testi-card" style={{transform: `translateY(${offset}px)`}}>
      {t.badge && <div className="testi-badge">{t.badge}</div>}
      <span className="testi-quote-icon">"</span>
      <div className="testi-stars">
        {Array(t.stars).fill(0).map((_, i) => (
          <span key={i} className="testi-star">★</span>
        ))}
      </div>
      <p className="testi-text">{t.text}</p>
      <div className="testi-author">
        <div className="testi-avatar" style={{background: t.grad}}>{t.initials}</div>
        <div>
          <div className="testi-name">{t.name}</div>
          <div className="testi-grade">{t.grade}</div>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Opiniones de estudiantes</div>
          <h2 className="section-title">Lo dicen ellos</h2>
          <p className="section-subtitle">
            Más de 50.000 estudiantes de toda España ya estudian con SmartStudIA.
          </p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <TestiCard key={i} t={t} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;