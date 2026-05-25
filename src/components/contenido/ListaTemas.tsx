// src/components/contenido/ListaTemas.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import Paywall from '../Paywall';

interface TemaResumen {
  id: string;
  titulo: string;
  numero_tema: number;
  nombre_tema: string;
}

export default function ListaTemas() {
  const { curso = '', asignatura = '' } = useParams<{ curso: string; asignatura: string }>();
  const navigate = useNavigate();
  const { isSubscribed } = useAuth() as { isSubscribed: boolean };

  const [temas, setTemas] = useState<TemaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPaywall, setMostrarPaywall] = useState(false);

  // Nombre legible para la cabecera
  const asignaturaLabel = asignatura
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  useEffect(() => {
    if (!curso || !asignatura) return;
    setLoading(true);
    setError(null);

    const temasRef = collection(db, 'contenido', curso, 'asignaturas', asignatura, 'temas');
    const q = query(temasRef, where('publicado', '==', true), orderBy('numero_tema'));

    getDocs(q)
      .then((snap) => {
        const items: TemaResumen[] = snap.docs.map((d) => ({
          id: d.id,
          titulo: d.data().titulo ?? `Tema ${d.data().numero_tema}`,
          numero_tema: d.data().numero_tema,
          nombre_tema: d.data().nombre_tema ?? '',
        }));
        setTemas(items);
      })
      .catch((err) => {
        console.error('ListaTemas error:', err);
        setError('No se pudieron cargar los temas. Inténtalo de nuevo.');
      })
      .finally(() => setLoading(false));
  }, [curso, asignatura]);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (mostrarPaywall) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <Paywall reason="premium_content" />
        <button
          onClick={() => setMostrarPaywall(false)}
          style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          ← Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7ff', padding: '0 0 3rem' }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(120deg, #4361ee, #3a0ca3)',
        color: '#fff',
        padding: '1.25rem 1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/contenido')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: '0.88rem', padding: 0, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            ← Asignaturas
          </button>
          <div style={{ fontSize: '0.8rem', color: '#c8d6ff', marginBottom: '0.3rem' }}>{curso}</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            {asignaturaLabel}
          </h1>
          {!isSubscribed && (
            <p style={{ margin: '0.5rem 0 0', color: '#ffe082', fontSize: '0.84rem', fontWeight: 600 }}>
              🔒 Plan Gratuito — solo el Tema 1 está disponible
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Estados de carga */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Cargando temas...
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && !error && temas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ fontWeight: 600 }}>Aún no hay temas publicados para esta asignatura.</p>
            <p style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>Vuelve pronto, ¡estamos generando el contenido!</p>
          </div>
        )}

        {/* Lista de temas */}
        {!loading && temas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {temas.map((tema) => {
              const libre = isSubscribed || tema.numero_tema === 1;

              return (
                <div
                  key={tema.id}
                  onClick={() => {
                    if (libre) {
                      navigate(`/contenido/${curso}/${asignatura}/${tema.numero_tema}`);
                    } else {
                      setMostrarPaywall(true);
                    }
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    border: '2px solid',
                    borderColor: libre ? 'transparent' : '#e5e7eb',
                    opacity: libre ? 1 : 0.75,
                    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (libre) {
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                      (e.currentTarget as HTMLElement).style.borderColor = '#4361ee';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(67,97,238,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = libre ? 'transparent' : '#e5e7eb';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                  }}
                >
                  {/* Número */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: libre ? 'linear-gradient(135deg, #4361ee, #3a0ca3)' : '#f3f4f6',
                    color: libre ? '#fff' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.95rem',
                  }}>
                    {libre ? tema.numero_tema : '🔒'}
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tema.titulo}
                    </div>
                    {tema.nombre_tema && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' }}>
                        {tema.nombre_tema}
                      </div>
                    )}
                  </div>

                  {/* Chips de contenido */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    {['📝', '❓', '🃏', '🎬'].map((icon) => (
                      <span key={icon} style={{
                        fontSize: '0.9rem',
                        opacity: libre ? 1 : 0.4,
                      }}>{icon}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie: CTA premium si es free y hay más de 1 tema */}
        {!isSubscribed && !loading && temas.length > 1 && (
          <div style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #3a0ca3, #4361ee)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            color: '#fff',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔓</div>
            <p style={{ fontWeight: 700, margin: '0 0 0.3rem' }}>
              {temas.length - 1} tema{temas.length - 1 !== 1 ? 's' : ''} más esperando
            </p>
            <p style={{ color: '#c8d6ff', fontSize: '0.88rem', margin: '0 0 1rem' }}>
              Desbloquea todo el contenido con el Plan Básico
            </p>
            <button
              onClick={() => setMostrarPaywall(true)}
              style={{
                background: '#fff', color: '#3a0ca3', border: 'none',
                borderRadius: '8px', padding: '0.6rem 1.5rem',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Ver planes →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
