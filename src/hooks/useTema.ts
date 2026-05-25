// src/hooks/useTema.ts
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface Apartado {
  subtitulo: string;
  contenido: string;
}

export interface Pregunta {
  pregunta: string;
  opciones: string[];   // ["A) ...", "B) ...", "C) ...", "D) ..."]
  correcta: number;     // índice 0-3
  explicacion: string;
}

export interface Tarjeta {
  frente: string;
  reverso: string;
}

export interface TemaData {
  titulo: string;
  nombre_tema: string;
  numero_tema: number;
  curso: string;
  asignatura: string;
  publicado: boolean;
  createdAt: any;
  resumen: {
    titulo: string;
    apartados: Apartado[];
  };
  cuestionario: Pregunta[];
  tarjetas: Tarjeta[];
  guion_video: string;
  video_url?: string;   // URL de YouTube (opcional, para futuros vídeos)
}

interface UseTemaReturn {
  tema: TemaData | null;
  loading: boolean;
  error: string | null;
  canAccess: boolean;   // false → mostrar Paywall
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useTema(
  curso: string,
  asignatura: string,
  numeroTema: number
): UseTemaReturn {
  const { currentUser, isSubscribed } = useAuth() as {
    currentUser: any;
    isSubscribed: boolean;
  };

  const [tema, setTema] = useState<TemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usuarios free solo pueden acceder al tema 1
  const canAccess = isSubscribed || numeroTema === 1;

  useEffect(() => {
    setTema(null);
    setError(null);
    setLoading(true);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    if (!canAccess) {
      setLoading(false);
      return;
    }

    const docRef = doc(
      db,
      'contenido', curso,
      'asignaturas', asignatura,
      'temas', String(numeroTema)
    );

    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as TemaData;
          if (!data.publicado) {
            setError('Este tema aún no está publicado.');
          } else {
            setTema(data);
          }
        } else {
          setError('Este tema no tiene contenido todavía.');
        }
      })
      .catch((err) => {
        console.error('useTema error:', err);
        setError('Error al cargar el tema. Inténtalo de nuevo.');
      })
      .finally(() => setLoading(false));
  }, [curso, asignatura, numeroTema, currentUser?.uid, canAccess]);

  return { tema, loading, error, canAccess };
}
