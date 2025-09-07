// src/components/subjects/SubjectsPage.js

import React from 'react';
import SubjectCard from './SubjectCard';
import subjectsData from './subjectsData';
import '../../App.css'; // Asegúrate de que la ruta sea correcta

function SubjectsPage() {
  return (
    <section className="subjects">
      <div className="container">
        <h2 className="section-title">Asignaturas de 1º de la ESO</h2>
        <div className="subjects-grid">
          {subjectsData.map((subject, index) => (
            <SubjectCard key={index} subject={subject} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubjectsPage;