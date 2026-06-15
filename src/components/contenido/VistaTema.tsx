// src/components/contenido/VistaTema.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import Paywall from '../Paywall';

type Tab = 'resumen' | 'cuestionario' | 'tarjetas' | 'video';

// Extrae el ID de vídeo de cualquier forma de URL de YouTube
// (youtu.be/ID, watch?v=ID, /embed/ID, /shorts/ID, con o sin parámetros)
// y devuelve la URL de inserción canónica. Devuelve null si no la reconoce.
function getYoutubeEmbedUrl(url?: string): string | null {
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
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resumen',      label: 'Resumen',      icon: '📝' },
  { id: 'cuestionario', label: 'Cuestionario', icon: '❓' },
  { id: 'tarjetas',     label: 'Tarjetas',     icon: '🃏' },
  { id: 'video',        label: 'Vídeo',        icon: '🎬' },
];

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
      Cargando tema...
    </div>
  );
}

// ── Tab: Resumen ───────────────────────────────────────────────────────────────
function TabResumen({ resumen }: { resumen: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {resumen.apartados.map((ap: any, i: number) => (
        <div key={i} style={{
          background: '#fff', borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderLeft: '4px solid #4361ee',
        }}>
          <h3 style={{ margin: '0 0 0.6rem', color: '#3a0ca3', fontSize: '1rem', fontWeight: 700 }}>
            {ap.subtitulo}
          </h3>
          <p style={{ margin: 0, color: '#374151', lineHeight: 1.7, fontSize: '0.93rem', whiteSpace: 'pre-line' }}>
            {ap.contenido}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Cuestionario ─────────────────────────────────────────────────────────
function TabCuestionario({ preguntas }: { preguntas: any[] }) {
  const [seleccionadas, setSeleccionadas] = useState<(number | null)[]>(
    () => Array(preguntas.length).fill(null)
  );
  const [enviado, setEnviado] = useState(false);

  const score = preguntas.filter((p, i) => seleccionadas[i] === p.correcta).length;
  const total  = preguntas.length;
  const pct    = Math.round((score / total) * 100);

  const colores = {
    correcta: '#d1fae5',
    incorrecta: '#fee2e2',
    border_correcta: '#059669',
    border_incorrecta: '#dc2626',
  };

  const reset = () => {
    setSeleccionadas(Array(preguntas.length).fill(null));
    setEnviado(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Resultado */}
      {enviado && (
        <div style={{
          background: pct >= 70 ? '#d1fae5' : '#fff3cd',
          border: `2px solid ${pct >= 70 ? '#059669' : '#f59e0b'}`,
          borderRadius: '12px', padding: '1rem 1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem' }}>{pct >= 70 ? '🏆' : '📚'}</div>
          <p style={{ fontWeight: 800, fontSize: '1.3rem', margin: '0.3rem 0 0.2rem', color: '#1a1a2e' }}>
            {score}/{total} correctas · {pct}%
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
            {pct >= 90 ? '¡Excelente! Dominas el tema.' : pct >= 70 ? '¡Bien! Repasa los errores.' : 'Sigue estudiando, ¡tú puedes!'}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '0.75rem', background: '#4361ee', color: '#fff',
              border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
            }}
          >
            Volver a intentarlo
          </button>
        </div>
      )}

      {/* Preguntas */}
      {preguntas.map((p, i) => {
        const sel = seleccionadas[i];
        const correcta = p.correcta;
        return (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#4361ee', marginRight: '0.4rem' }}>{i + 1}.</span>
              {p.pregunta}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {p.opciones.map((op: string, j: number) => {
                let bg = '#f9fafb';
                let border = '#e5e7eb';
                let color = '#374151';

                if (enviado) {
                  if (j === correcta) {
                    bg = colores.correcta; border = colores.border_correcta; color = '#065f46';
                  } else if (j === sel && j !== correcta) {
                    bg = colores.incorrecta; border = colores.border_incorrecta; color = '#7f1d1d';
                  }
                } else if (sel === j) {
                  bg = '#ede9fe'; border = '#7c3aed'; color = '#4c1d95';
                }

                return (
                  <button
                    key={j}
                    disabled={enviado}
                    onClick={() => {
                      if (!enviado) {
                        const nueva = [...seleccionadas];
                        nueva[i] = j;
                        setSeleccionadas(nueva);
                      }
                    }}
                    style={{
                      background: bg, border: `1.5px solid ${border}`, borderRadius: '8px',
                      padding: '0.55rem 0.9rem', textAlign: 'left', cursor: enviado ? 'default' : 'pointer',
                      color, fontSize: '0.88rem', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}
                  >
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: sel === j ? (enviado ? (j === correcta ? '#059669' : '#dc2626') : '#7c3aed') : '#e5e7eb',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', color: sel === j ? '#fff' : 'transparent',
                    }}>
                      {sel === j ? (enviado ? (j === correcta ? '✓' : '✗') : '•') : ''}
                    </span>
                    {op}
                  </button>
                );
              })}
            </div>

            {/* Explicación */}
            {enviado && (
              <div style={{
                marginTop: '0.75rem', background: '#f0f4ff',
                borderRadius: '8px', padding: '0.6rem 0.9rem',
                fontSize: '0.83rem', color: '#3730a3', lineHeight: 1.5,
              }}>
                💡 {p.explicacion}
              </div>
            )}
          </div>
        );
      })}

      {/* Botón enviar */}
      {!enviado && (
        <button
          onClick={() => setEnviado(true)}
          disabled={seleccionadas.some((s) => s === null)}
          style={{
            background: seleccionadas.some((s) => s === null) ? '#d1d5db' : '#4361ee',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1rem',
            cursor: seleccionadas.some((s) => s === null) ? 'not-allowed' : 'pointer',
            alignSelf: 'center', transition: 'background 0.15s',
          }}
        >
          Ver resultados
        </button>
      )}
    </div>
  );
}

// ── Tab: Tarjetas (flip 3D) ────────────────────────────────────────────────────
function TabTarjetas({ tarjetas }: { tarjetas: any[] }) {
  const [volteadas, setVolteadas] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setVolteadas((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '0.88rem', marginBottom: '1rem' }}>
        Haz clic en una tarjeta para ver la definición · {tarjetas.length} tarjetas
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {tarjetas.map((t, i) => {
          const isFlipped = volteadas.has(i);
          return (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{ perspective: '1000px', cursor: 'pointer', height: '150px' }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}>
                {/* Frente */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(67,97,238,0.2)',
                }}>
                  <p style={{
                    color: '#fff', fontWeight: 700, textAlign: 'center',
                    fontSize: '0.88rem', lineHeight: 1.4, margin: 0,
                  }}>
                    {t.frente}
                  </p>
                </div>

                {/* Reverso */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: '#fff',
                  border: '2px solid #4361ee',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(67,97,238,0.12)',
                }}>
                  <p style={{
                    color: '#1a1a2e', textAlign: 'center',
                    fontSize: '0.84rem', lineHeight: 1.5, margin: 0,
                  }}>
                    {t.reverso}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Tab: Vídeo / Guión ────────────────────────────────────────────────────────
function TabVideo({ videoUrl, guionVideo }: { videoUrl?: string; guionVideo: string }) {
  const [mostrarGuion, setMostrarGuion] = useState(false);

  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  if (embedUrl) {
    return (
      <div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <iframe
            src={embedUrl}
            title="Vídeo educativo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
        {guionVideo && (
          <button
            onClick={() => setMostrarGuion(!mostrarGuion)}
            style={{
              marginTop: '1rem', background: 'none', border: '1.5px solid #4361ee',
              color: '#4361ee', borderRadius: '8px', padding: '0.4rem 1rem',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            {mostrarGuion ? '↑ Ocultar guión' : '📄 Ver guión del vídeo'}
          </button>
        )}
        {mostrarGuion && guionVideo && <GuionTexto guion={guionVideo} />}
      </div>
    );
  }

  // Sin URL de vídeo: mostrar guión como lectura
  return (
    <div>
      <div style={{
        background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '10px',
        padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#92400e',
      }}>
        🎬 El vídeo aún no está disponible. Aquí tienes el guión para estudiar el tema.
      </div>
      <GuionTexto guion={guionVideo} />
    </div>
  );
}

function GuionTexto({ guion }: { guion: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      borderLeft: '4px solid #7c3aed',
      marginTop: '0.75rem',
    }}>
      <p style={{
        color: '#374151', lineHeight: 1.8, fontSize: '0.93rem',
        whiteSpace: 'pre-line', margin: 0,
      }}>
        {guion}
      </p>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function VistaTema() {
  const { curso = '', asignatura = '', numeroTema = '1' } = useParams<{
    curso: string; asignatura: string; numeroTema: string;
  }>();
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState<Tab>('resumen');

  const { tema, loading, error, canAccess } = useTema(
    curso, asignatura, parseInt(numeroTema, 10)
  );

  // Nombre legible
  const asignaturaLabel = asignatura
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  // ── Paywall ──────────────────────────────────────────────────────────────────
  if (!canAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <Paywall reason="premium_content" />
        <button
          onClick={() => navigate(`/contenido/${curso}/${asignatura}`)}
          style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          ← Volver a los temas
        </button>
      </div>
    );
  }

  // ── Carga / error ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7ff', paddingBottom: '3rem' }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(120deg, #4361ee, #3a0ca3)',
        color: '#fff',
        padding: '1.25rem 1.5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(`/contenido/${curso}/${asignatura}`)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: '0.88rem', padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            ← {asignaturaLabel}
          </button>
          <div style={{ fontSize: '0.8rem', color: '#c8d6ff' }}>
            {curso} · {asignaturaLabel} · Tema {numeroTema}
          </div>
          {tema && (
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.3rem 0 0' }}>
              {tema.resumen.titulo}
            </h1>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.25rem 1.5rem' }}>

        {loading && <Spinner />}

        {error && !loading && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {tema && !loading && (
          <>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0.3rem', marginBottom: '1.5rem',
              background: '#fff', borderRadius: '12px', padding: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflowX: 'auto',
            }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTabActiva(t.id)}
                  style={{
                    flex: 1, minWidth: '80px',
                    background: tabActiva === t.id
                      ? 'linear-gradient(135deg, #4361ee, #3a0ca3)'
                      : 'transparent',
                    color: tabActiva === t.id ? '#fff' : '#6b7280',
                    border: 'none', borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                    transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.35rem', whiteSpace: 'nowrap',
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Contenido del tab */}
            {tabActiva === 'resumen' && (
              <TabResumen resumen={tema.resumen} />
            )}
            {tabActiva === 'cuestionario' && (
              <TabCuestionario preguntas={tema.cuestionario} />
            )}
            {tabActiva === 'tarjetas' && (
              <TabTarjetas tarjetas={tema.tarjetas} />
            )}
            {tabActiva === 'video' && (
              <TabVideo videoUrl={tema.video_url} guionVideo={tema.guion_video} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
