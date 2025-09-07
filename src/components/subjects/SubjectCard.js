// src/components/subjects/SubjectCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css'; // Asegúrate de que la ruta sea correcta

function SubjectCard({ subject }) {
  return (
    <div className="subject-card">
      <div className={`subject-icon ${subject.color}`}>
        <i className={subject.icon}></i>
      </div>
      <div className="subject-content">
        <h3>{subject.name}</h3>
        <p>{subject.description}</p>
        <Link to={`/asignaturas/${subject.name.toLowerCase().replace(/ /g, '-')}`} className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
          Explorar
        </Link>
      </div>
    </div>
  );
}

export default SubjectCard;