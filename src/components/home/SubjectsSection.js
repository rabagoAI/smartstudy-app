// src/components/home/SubjectsSection.js

import React from 'react';
import { Link } from 'react-router-dom';
import './SubjectsSection.css'; // Asegúrate de crear este archivo

const subjects = [
  {
    id: 'lengua-castellana',
    name: 'Lengua Castellana',
    description: 'Apuntes, ejercicios y exámenes resueltos.',
    icon: 'fas fa-book',
    colorClass: 'language'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    description: 'Problemas resueltos paso a paso.',
    icon: 'fas fa-calculator',
    colorClass: 'maths'
  },
  {
    id: 'geografia-e-historia',
    name: 'Geografía e Historia',
    description: 'Mapas, líneas de tiempo y resúmenes.',
    icon: 'fas fa-globe-americas',
    colorClass: 'social'
  },
  {
  id: 'biologia',
  name: 'Biología',
  description: 'Células, seres vivos, ecosistemas y más.',
  icon: 'fas fa-dna', // ✅ Icono más específico para biología
  colorClass: 'science'
},
  {
    id: 'ingles',
    name: 'Inglés',
    description: 'Vocabulario, gramática y listening.',
    icon: 'fas fa-language',
    colorClass: 'english'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    description: 'Proyectos, diseños y fundamentos técnicos.',
    icon: 'fas fa-laptop-code',
    colorClass: 'tech'
  }
];

function SubjectsSection() {
  return (
    <section className="subjects">
      <div className="container">
        <h2 className="section-title">Asignaturas de 1º de la ESO</h2>
        <p className="section-subtitle">
          Elige tu asignatura y empieza a estudiar con recursos hechos por expertos.
        </p>
        
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <Link 
              key={subject.id} 
              to={`/asignaturas/${subject.id}`} 
              className="subject-card-link"
            >
              <div className="subject-card">
                <div className={`subject-icon ${subject.colorClass}`}>
                  <i className={subject.icon}></i>
                </div>
                <div className="subject-content">
                  <h3>{subject.name}</h3>
                  <p>{subject.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubjectsSection;