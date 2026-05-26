// src/components/admin/PublicarTemas.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  collection, query, where, getDocs,
  doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

// Todas las combinaciones conocidas de curso/asignatura.
// Consultas directas por ruta en vez de collectionGroup
// para evitar el bug de permisos con get() en reglas.
const CURSOS = ['1ESO', '2ESO', '3ESO', '4ESO', '1BAC', '2BAC'];
const ASIGNATURAS = [
  'Matematicas', 'LenguaEspanola', 'BiologiaGeologia',
  'GeografiaHistoria', 'Ingles', 'FisicaQuimica', 'Tecnologia', 'EdFisica',
];

interface TemaItem {
  ref: any;
  path: string;
  titulo: string;
  nombre_tema: string;
  numero_tema: number;
  curso: string;
  asignatura: string;
  createdAt: Timestamp | null;
}

export default function PublicarTemas() {
  const { isAdmin } = useAuth() as { isAdmin: boolean };

  // Segunda barrera de seguridad
  if (!isAdmin) return <Navigate to="/home" replace />;

  const [temas, setTemas] = useState<TemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicando, setPublicando] = useState<Set<string>>(new Set());
  const [publicados, setPublicados] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // ── Cargar temas no publicados ───────────────────────────────────────────────
  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lanzamos una query por cada curso×asignatura en paralelo.
      // Evita collectionGroup para no depender del bug de get() en reglas.
      const snapshots = await Promise.all(
        CURSOS.flatMap((curso) =>
          ASIGNATURAS.map((asig) =>
            getDocs(
              query(
                collection(db, 'contenido', curso, 'asignaturas', asig, 'temas'),
                where('publicado', '==', false)
              )
            )
          )
        )
      );

      const items: TemaItem[] = snapshots
        .flatMap((snap) => snap.docs)
        .map((d) => {
          const data = d.data();
          return {
            ref: d.ref,
            path: d.ref.path,
            titulo:      data.titulo ?? `Tema ${data.numero_tema}`,
            nombre_tema: data.nombre_tema ?? '',
            numero_tema: data.numero_tema,
            curso:       data.curso ?? '—',
            asignatura:  data.asignatura ?? '—',
            createdAt:   data.createdAt ?? null,
          };
        });

      // Ordenar por curso → asignatura → numero_tema
      items.sort((a, b) =>
        a.curso.localeCompare(b.curso) ||
        a.asignatura.localeCompare(b.asignatura) ||
        a.numero_tema - b.numero_tema
      );
      setTemas(items);
    } catch (err) {
      console.error('PublicarTemas error:', err);
      setError('Error al cargar los temas. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── Publicar un tema ─────────────────────────────────────────────────────────
  const publicar = async (item: TemaItem) => {
    setPublicando((prev) => new Set(prev).add(item.path));
    try {
      await updateDoc(item.ref, { publicado: true });
      setPublicados((prev) => new Set(prev).add(item.path));
      setTemas((prev) => prev.filter((t) => t.path !== item.path));
    } catch (err) {
      console.error('Error publicando tema:', err);
      alert('Error al publicar el tema. Inténtalo de nuevo.');
    } finally {
      setPublicando((prev) => {
        const s = new Set(prev);
        s.delete(item.path);
        return s;
      });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7ff', paddingBottom: '3rem' }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(120deg, #7209b7, #3a0ca3)',
        color: '#fff', padding: '1.5rem',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>
            Panel de administración
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            🗂️ Publicar Temas
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
            Temas generados con <code style={{ background: 'rgba(255,255,255,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>generar_tema.py</code> pendientes de publicación
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Barra de acciones */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontWeight: 700, color: '#374151' }}>
            {loading ? 'Cargando...' : `${temas.length} tema${temas.length !== 1 ? 's' : ''} pendiente${temas.length !== 1 ? 's' : ''}`}
          </span>
          <button
            onClick={cargar}
            disabled={loading}
            style={{
              background: '#fff', border: '1.5px solid #d1d5db', borderRadius: '8px',
              padding: '0.4rem 1rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem', color: '#374151', fontWeight: 600,
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Notificaciones de éxito */}
        {publicados.size > 0 && (
          <div style={{
            background: '#d1fae5', border: '1px solid #059669', borderRadius: '10px',
            padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.88rem', color: '#065f46',
          }}>
            ✅ {publicados.size} tema{publicados.size !== 1 ? 's' : ''} publicado{publicados.size !== 1 ? 's' : ''} correctamente.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #dc2626', borderRadius: '10px',
            padding: '0.75rem 1rem', marginBottom: '1rem',
            fontSize: '0.88rem', color: '#7f1d1d',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            ⏳ Cargando temas pendientes...
          </div>
        )}

        {/* Lista vacía */}
        {!loading && temas.length === 0 && !error && (
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '3rem',
            textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <p style={{ fontWeight: 700, color: '#374151', margin: 0 }}>
              Todo publicado
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: '0.3rem 0 0' }}>
              No hay temas pendientes de publicación.
            </p>
          </div>
        )}

        {/* Lista de temas */}
        {!loading && temas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {temas.map((t) => {
              const estaPublicando = publicando.has(t.path);
              return (
                <div
                  key={t.path}
                  style={{
                    background: '#fff', borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                  }}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#ede9fe', color: '#6d28d9',
                        borderRadius: '6px', padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {t.curso}
                      </span>
                      <span style={{
                        background: '#e0f2fe', color: '#0369a1',
                        borderRadius: '6px', padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {t.asignatura}
                      </span>
                      <span style={{
                        background: '#f3f4f6', color: '#6b7280',
                        borderRadius: '6px', padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        Tema {t.numero_tema}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', marginTop: '0.35rem', fontSize: '0.95rem' }}>
                      {t.titulo}
                    </div>
                    {t.nombre_tema && (
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                        {t.nombre_tema}
                      </div>
                    )}
                    {t.createdAt && (
                      <div style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: '0.25rem' }}>
                        Creado: {t.createdAt.toDate
                          ? t.createdAt.toDate().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : String(t.createdAt)}
                      </div>
                    )}
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => publicar(t)}
                    disabled={estaPublicando}
                    style={{
                      background: estaPublicando ? '#d1d5db' : 'linear-gradient(135deg, #059669, #047857)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '0.55rem 1.1rem', cursor: estaPublicando ? 'not-allowed' : 'pointer',
                      fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {estaPublicando ? '⏳ ...' : '✅ Publicar'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
