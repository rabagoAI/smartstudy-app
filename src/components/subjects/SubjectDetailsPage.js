// src/components/subjects/SubjectDetailsPage.js

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import subjectsData from './subjectsData';
import '../../App.css';

function SubjectDetailsPage() {
  // Obtener el nombre de la asignatura de la URL
  const { subjectName } = useParams();

  // Buscar la asignatura correspondiente
  const subject = subjectsData.find(
    (subj) => subj.name.toLowerCase().replace(/ /g, '-') === subjectName
  );

  if (!subject) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
        <h2>Asignatura no encontrada</h2>
        <p>Parece que la asignatura que buscas no está disponible.</p>
        <Link to="/asignaturas" className="btn btn-primary" style={{ marginTop: '20px' }}>Volver a asignaturas</Link>
      </div>
    );
  }

  return (
    <section className="subject-details">
      <div className="container">
        <h2 className="section-title" style={{ color: 'var(--primary)', borderBottom: `2px solid var(--primary)` }}>{subject.name}</h2>
        
        {/* Sección de Apuntes */}
        <div className="content-section">
          <div className="section-header">
            <h3><i className="fas fa-file-alt"></i> Apuntes</h3>
          </div>
          {subject.content.apuntes.length > 0 ? (
            <ul>
              {subject.content.apuntes.map((note, index) => (
                <li key={index}><a href={note.link}>{note.title}</a></li>
              ))}
            </ul>
          ) : (
            <p className="no-content-message">Pronto tendremos apuntes de esta asignatura. ¡Vuelve pronto!</p>
          )}
        </div>

        {/* Sección de Ejercicios */}
        <div className="content-section">
          <div className="section-header">
            <h3><i className="fas fa-pencil-alt"></i> Ejercicios Resueltos</h3>
          </div>
          {subject.content.ejercicios.length > 0 ? (
            <ul>
              {subject.content.ejercicios.map((exercise, index) => (
                <li key={index}><a href={exercise.link}>{exercise.title}</a></li>
              ))}
            </ul>
          ) : (
            <p className="no-content-message">Aún no hay ejercicios disponibles para esta asignatura.</p>
          )}
        </div>

        {/* Sección de Exámenes */}
        <div className="content-section">
          <div className="section-header">
            <h3><i className="fas fa-book-reader"></i> Exámenes</h3>
          </div>
          {subject.content.examenes.length > 0 ? (
            <ul>
              {subject.content.examenes.map((exam, index) => (
                <li key={index}><a href={exam.link}>{exam.title}</a></li>
              ))}
            </ul>
          ) : (
            <p className="no-content-message">Aún no hay exámenes disponibles para esta asignatura.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default SubjectDetailsPage;