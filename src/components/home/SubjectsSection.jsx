// src/components/home/SubjectsSection.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SubjectsSection.css';

const subjects = [
  {
    id: 'lengua-espanola',
    name: 'Lengua Española',
    description: 'Apuntes, ejercicios y exámenes resueltos.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-book',
    colorClass: 'language'
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    description: 'Problemas resueltos paso a paso.',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-calculator',
    colorClass: 'maths'
  },
  {
    id: 'biologia',
    name: 'Biología y Geología',
    description: 'Células, seres vivos, ecosistemas y más.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-dna',
    colorClass: 'science'
  },
  {
    id: 'geografia-e-historia',
    name: 'Geografía e Historia',
    description: 'Mapas, líneas de tiempo y resúmenes.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-globe-americas',
    colorClass: 'social'
  },
  {
    id: 'ingles',
    name: 'Inglés',
    description: 'Vocabulario, gramática y listening.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-language',
    colorClass: 'english'
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    description: 'Proyectos, diseños y fundamentos técnicos.',
    image: 'https://images.unsplash.com/photo-1531297424005-06342e7f3947?auto=format&fit=crop&w=500&q=60',
    icon: 'fas fa-laptop-code',
    colorClass: 'tech'
  }
];

// Componente para carga progresiva de imágenes
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`lazy-image-container ${className}`}>
      {/* Placeholder con efecto blur */}
      <div
        className="lazy-placeholder"
        style={{
          backgroundImage: `url(${src}&w=50)`,
          opacity: isLoaded ? 0 : 1
        }}
        aria-hidden="true"
      />

      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`lazy-image-real ${isLoaded ? 'loaded' : ''}`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

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
                <div className="subject-image-wrapper">
                  <LazyImage
                    src={subject.image}
                    alt={subject.name}
                    className="subject-cover"
                  />
                  <div className={`subject-icon-overlay ${subject.colorClass}`}>
                    <i className={subject.icon}></i>
                  </div>
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