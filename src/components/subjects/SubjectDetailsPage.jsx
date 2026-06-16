// src/components/subjects/SubjectDetailsPage.js
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, query, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import Paywall from "../Paywall";
import { useInfiniteQuery } from "@tanstack/react-query";
import "../../App.css";

// Función para limpiar el nombre de la asignatura
const formatSubjectName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "-");
};

// Extrae el ID de un vídeo de YouTube de cualquier forma de URL y devuelve la
// URL de inserción canónica, o null si no es de YouTube.
const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
};

// Reproductor de vídeo: usa <iframe> para YouTube y <video> nativo para archivos
// directos (Cloudinary). El <video> da controles nativos y no depende de frame-src.
const VideoPlayer = ({ url, title }) => {
  const embed = getYoutubeEmbedUrl(url);
  if (embed) {
    return (
      <iframe
        width="100%"
        height="315"
        src={embed}
        title={title}
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video
      controls
      preload="metadata"
      style={{ width: "100%", borderRadius: "8px", background: "#000" }}
    >
      <source src={url} />
      Tu navegador no soporta el vídeo.{" "}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Ábrelo aquí
      </a>
      .
    </video>
  );
};

const SubjectDetailsPage = () => {
  const { subjectName } = useParams();
  const { isSubscribed } = useAuth();

  const fetchContent = async ({ pageParam = null }) => {
    const formattedSubjectName = formatSubjectName(subjectName);
    let q = query(
      collection(db, "subjects", formattedSubjectName, "content"),
      orderBy("createdAt", "asc"),
      limit(20)
    );

    if (pageParam) {
      q = query(q, startAfter(pageParam));
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      nextPage: lastVisible || undefined,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ['subjectContent', subjectName],
    queryFn: fetchContent,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (status === 'pending') {
    return (
      <div className="subject-details">
        <div className="container">Cargando contenido...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="subject-details">
        <div className="container">Error: {error.message}</div>
      </div>
    );
  }

  const content = data?.pages.flatMap(page => page.data) || [];

  const displaySubjectName =
    subjectName.charAt(0).toUpperCase() +
    subjectName.slice(1).replace(/-/g, " ");
  const isPremiumUser = isSubscribed;

  // Filtrar contenido por tipo
  const pdfs = content.filter((item) => item.type === "pdf");
  const videos = content.filter((item) => item.type === "video");
  const exams = content.filter((item) => item.type === "exam");

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
                  {pdf.isPremium ? (
                    isPremiumUser ? (
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-button"
                      >
                        Descargar PDF
                      </a>
                    ) : (
                      <Paywall reason="premium_content" />
                    )
                  ) : (
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-button"
                    >
                      Descargar PDF
                    </a>
                  )}
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
                      <VideoPlayer url={video.url} title={video.title} />
                    ) : (
                      <Paywall reason="premium_content" />
                    )
                  ) : (
                    <div className="video-container">
                      <VideoPlayer url={video.url} title={video.title} />
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
                  {exam.isPremium ? (
                    isPremiumUser ? (
                      <a
                        href={exam.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="exam-button"
                      >
                        Ver examen resuelto
                      </a>
                    ) : (
                      <Paywall reason="premium_content" />
                    )
                  ) : (
                    <a
                      href={exam.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="exam-button"
                    >
                      Ver examen resuelto
                    </a>
                  )}
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

        {/* Load More Button */}
        {hasNextPage && (
          <div className="load-more-container" style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn btn-secondary"
            >
              {isFetchingNextPage ? 'Cargando más...' : 'Cargar más contenido'}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default SubjectDetailsPage;