// src/components/subjects/SubjectsPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import SubjectCard from './SubjectCard';
import subjectsData from './subjectsData';
import '../../App.css';

function SubjectsPage() {
  return (
    <section className="subjects">
      <div className="container">
        <h2 className="section-title">Asignaturas de 1º de la ESO</h2>
        <div className="subjects-grid">
          {subjectsData.map((subject, index) => (
            <Link
              key={index}
              to={`/asignaturas/${subject.name.toLowerCase().replace(/ /g, '-')}`}
            >
              <SubjectCard subject={subject} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubjectsPage;