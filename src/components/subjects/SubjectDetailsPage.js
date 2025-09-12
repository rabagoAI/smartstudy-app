// src/components/subjects/SubjectDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase'; // Asegúrate de que esta ruta sea correcta
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import '../../App.css'; // Asegúrate de importar tu archivo CSS

const SubjectDetailsPage = () => {
  const { subjectName } = useParams();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'subjects', subjectName.toLowerCase(), 'content'),
          orderBy('createdAt', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const contentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setContent(contentList);
      } catch (err) {
        console.error("Error al obtener el contenido de la asignatura:", err);
        setError("No se pudo cargar el contenido. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [subjectName]);

  if (loading) {
    return <div>Cargando contenido...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="subject-details">
      <div className="container">
        <h2 className="section-title">{subjectName.charAt(0).toUpperCase() + subjectName.slice(1)}</h2>
        
        {content.length > 0 ? (
          content.map((item, index) => (
            <div key={item.id} className="content-section">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              
              {/* Contenedor del video con la clase "video-container" */}
              {item.type === 'video' && (
                <div className="video-container">
                  <iframe
                    width="560"
                    height="315"
                    src={item.url}
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              {/* El enlace del PDF con la clase "pdf-button" */}
              {item.type === 'pdf' && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="pdf-button"
                >
                  Ver resumen en PDF
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="no-content-message">No hay contenido disponible para esta asignatura todavía.</p>
        )}
      </div>
    </div>
  );
};

export default SubjectDetailsPage;