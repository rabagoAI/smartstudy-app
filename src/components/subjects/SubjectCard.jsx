import React from 'react';
import { Link } from 'react-router-dom';
import '../../App.css';

function SubjectCard({ subject }) {
  // ✅ CORREGIDO: Usar la propiedad 'url' explícita si existe, para coincidir con la BD
  const subjectUrl = `/asignaturas/${subject.url || subject.name.toLowerCase().replace(/ /g, '-')}`;

  return (
    <div className="subject-card">
      <div className={`subject-icon ${subject.color}`}>
        <i className={subject.icon}></i>
      </div>
      <div className="subject-content">
        <h3>{subject.name}</h3>
        <p>{subject.description}</p>
        <Link to={subjectUrl} className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}>
          Explorar
        </Link>
      </div>
    </div>
  );
}

export default SubjectCard;