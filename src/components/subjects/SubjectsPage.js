// src/components/subjects/SubjectsPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import SubjectCard from './SubjectCard';
import subjectsData from './subjectsData';
import '../../App.css';
import SEO from '../common/SEO'; // ✅ Añade esta línea

function SubjectsPage() {
  return (
    <>
      {/* ✅ Añade el componente SEO aquí */}
      <SEO
        title="Asignaturas de 1º ESO - SmartStudy"
        description="Accede a apuntes, videos y exámenes resueltos de todas las asignaturas de 1º de la ESO."
        image="https://res.cloudinary.com/ds7shn66t/image/upload/v1758619415/Banner_Conceptual_SmartStudy_xc8zaf.jpg"
        url="https://smartstudy.vercel.app/asignaturas"
      />

      <section className="subjects">
        <div className="container">
          <h2 className="section-title">Asignaturas de 1º de la ESO</h2>
          <div className="subjects-grid">
            {subjectsData.map((subject, index) => (
              <Link key={index} to={`/asignaturas/${subject.url}`}>
                <SubjectCard subject={subject} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default SubjectsPage;