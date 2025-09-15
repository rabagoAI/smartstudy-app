// src/components/subjects/SubjectDetailsPage.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { db } from "../../firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import SubscriptionModal from "../common/SubscriptionModal";
import "../../App.css";

// Función para limpiar el nombre de la asignatura
const formatSubjectName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "-");
};

const SubjectDetailsPage = () => {
  const { subjectName } = useParams();
  const { userData } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const formattedSubjectName = formatSubjectName(subjectName);

        const q = query(
          collection(db, "subjects", formattedSubjectName, "content"),
          orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(q);
        const contentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setContent(contentList);
      } catch (err) {
        console.error("Error al obtener el contenido de la asignatura:", err);
        setError(
          "No se pudo cargar el contenido. Por favor, inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [subjectName]);

  if (loading) {
    return (
      <div className="subject-details">
        <div className="container">Cargando contenido...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subject-details">
        <div className="container">Error: {error}</div>
      </div>
    );
  }

  const displaySubjectName =
    subjectName.charAt(0).toUpperCase() +
    subjectName.slice(1).replace(/-/g, " ");
  const isPremiumUser = userData?.subscriptionStatus === "premium";

  // Filtrar contenido por tipo
  const pdfs = content.filter((item) => item.type === "pdf");
  const videos = content.filter((item) => item.type === "video");
  const exams = content.filter((item) => item.type === "exam"); // Asumiendo que usas 'exam' para exámenes

  return (
    <div className="subject-details">
      <div className="container">
        <h2 className="section-title">{displaySubjectName}</h2>

        {/* Sección 1: Apuntes Organizados (PDF) */}
        {pdfs.length > 0 && (
          <div className="content-section">
            <h3>
              <i className="fas fa-book"></i> Apuntes Organizados
            </h3>
            <p>
              Descarga los resúmenes y apuntes para estudiar de forma eficiente.
            </p>
            <div className="content-grid">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="content-card">
                  <h4>{pdf.title}</h4>
                  <p>{pdf.description}</p>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdf-button"
                  >
                    Descargar PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección 2: Vídeos Explicativos */}
        {videos.length > 0 && (
          <div className="content-section">
            <h3>
              <i className="fas fa-video"></i> Vídeos Explicativos
            </h3>
            <p>
              Explicaciones claras y sencillas para entender los conceptos más
              difíciles.
            </p>
            <div className="videos-grid">
              {videos.map((video) => (
                <div key={video.id} className="video-card">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  {video.isPremium ? (
                    isPremiumUser ? (
                      <div className="video-container">
                        <iframe
                          width="100%"
                          height="315"
                          src={video.url}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="premium-gate">
                        <h4>Contenido Premium 🌟</h4>
                        <p>
                          Este video solo está disponible para usuarios premium.
                        </p>
                        <button
                          className="btn btn-primary"
                          onClick={() => setModalOpen(true)}
                        >
                          Ver planes de suscripción
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="video-container">
                      <iframe
                        width="100%"
                        height="315"
                        src={video.url}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección 3: Exámenes Resueltos */}
        {exams.length > 0 && (
          <div className="content-section">
            <h3>
              <i className="fas fa-clipboard-list"></i> Exámenes Resueltos
            </h3>
            <p>
              Practica con exámenes de años anteriores y comprueba tus
              respuestas.
            </p>
            <div className="exams-grid">
              {exams.map((exam) => (
                <div key={exam.id} className="exam-card">
                  <h4>{exam.title}</h4>
                  <p>{exam.description}</p>
                  <a
                    href={exam.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="exam-button"
                  >
                    Ver examen resuelto
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.length === 0 && (
          <p className="no-content-message">
            No hay contenido disponible para esta asignatura todavía.
          </p>
        )}
      </div>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default SubjectDetailsPage;
