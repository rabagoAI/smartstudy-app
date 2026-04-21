// src/components/home/SubjectsSection.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SubjectsSection.css';

const subjects = [
  {
    id: 'lengua-espanola',
    name: 'Lengua Española',
    description: 'Gramática, literatura y expresión escrita para dominar el idioma.',
    icon: '📖',
    color: '#ff4f6d',
    bg: '#fff0f3',
    tagBg: '#ff4f6d18',
    tagColor: '#cc1535',
    tag: 'Obligatoria'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    description: 'Álgebra, geometría y resolución de problemas con IA paso a paso.',
    icon: '📐',
    color: '#f59e0b',
    bg: '#fffbeb',
    tagBg: '#f59e0b18',
    tagColor: '#b45309',
    tag: 'Obligatoria'
  },
  {
    id: 'biologia',
    name: 'Biología y Geología',
    description: 'Ciencias de la vida y la Tierra. Ecosistemas, células y rocas.',
    icon: '🔬',
    color: '#10b981',
    bg: '#ecfdf5',
    tagBg: '#10b98118',
    tagColor: '#047857',
    tag: 'Ciencias'
  },
  {
    id: 'geografia-e-historia',
    name: 'Geografía e Historia',
    description: 'El mundo, sus culturas y la historia de la humanidad.',
    icon: '🗺️',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    tagBg: '#0ea5e918',
    tagColor: '#0369a1',
    tag: 'Sociales'
  },
  {
    id: 'ingles',
    name: 'Inglés',
    description: 'Speaking, writing y comprensión lectora con tutor IA nativo.',
    icon: '🌍',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    tagBg: '#8b5cf618',
    tagColor: '#6d28d9',
    tag: 'Idiomas'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    description: 'Programación, diseño y resolución de problemas tecnológicos.',
    icon: '⚙️',
    color: '#ec4899',
    bg: '#fdf2f8',
    tagBg: '#ec489918',
    tagColor: '#be185d',
    tag: 'Aplicada'
  }
];

// Componente de tarjeta de asignatura
const SubjectCard = ({ subject, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/asignaturas/${subject.id}`}
      className="subject-card-link"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="subject-card"
        style={{
          background: hovered ? subject.bg : '#fff',
          boxShadow: hovered
            ? `0 16px 48px ${subject.color}22, 0 4px 12px ${subject.color}18`
            : '0 4px 24px rgba(0,0,0,0.06)',
          animationDelay: `${index * 0.07}s`
        }}
      >
        <div
          className="subject-overlay"
          style={{
            background: `${subject.color}08`,
            opacity: hovered ? 1 : 0
          }}
        />

        <div
          className="subject-icon-wrap"
          style={{ background: `${subject.color}18` }}
        >
          {subject.icon}
        </div>

        <div className="subject-name">{subject.name}</div>
        <div className="subject-desc">{subject.description}</div>

        <span
          className="subject-tag"
          style={{
            background: subject.tagBg,
            color: subject.tagColor
          }}
        >
          {subject.tag}
        </span>

        <div
          className="subject-arrow"
          style={{
            background: `${subject.color}20`,
            color: subject.color
          }}
        >
          →
        </div>
      </div>
    </Link>
  );
};

function SubjectsSection() {
  return (
    <section className="subjects">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Asignaturas de 1° ESO</div>
          <h2 className="section-title">Domina cada asignatura<br/>con tu IA personal</h2>
          <p className="section-subtitle">
            Elige tu asignatura y empieza a estudiar con un tutor que nunca se cansa de explicar.
          </p>
        </div>

        <div className="subjects-grid">
          {subjects.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubjectsSection;