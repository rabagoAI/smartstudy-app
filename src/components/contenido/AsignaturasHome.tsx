// src/components/contenido/AsignaturasHome.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Config estática de cursos y asignaturas ───────────────────────────────────

const CURSOS = ['1ESO', '2ESO', '3ESO', '4ESO', '1BAC', '2BAC'];

interface Asignatura {
  id: string;        // ID en Firestore (coincide con --asignatura del script)
  nombre: string;
  icon: string;
  descripcion: string;
  color: string;
}

const ASIGNATURAS: Asignatura[] = [
  {
    id: 'Matematicas',
    nombre: 'Matemáticas',
    icon: '📐',
    descripcion: 'Álgebra, geometría, estadística, funciones y mucho más.',
    color: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
  },
  {
    id: 'LenguaEspanola',
    nombre: 'Lengua Española',
    icon: '📖',
    descripcion: 'Gramática, literatura, ortografía y técnicas de redacción.',
    color: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)',
  },
  {
    id: 'BiologiaGeologia',
    nombre: 'Biología y Geología',
    icon: '🔬',
    descripcion: 'Seres vivos, ecosistemas, geología y evolución.',
    color: 'linear-gradient(135deg, #2dc653 0%, #1a7a33 100%)',
  },
  {
    id: 'GeografiaHistoria',
    nombre: 'Geografía e Historia',
    icon: '🌍',
    descripcion: 'El mundo, sus civilizaciones, historia y geografía.',
    color: 'linear-gradient(135deg, #ff9f1c 0%, #e07b00 100%)',
  },
  {
    id: 'Ingles',
    nombre: 'Inglés',
    icon: '🇬🇧',
    descripcion: 'Vocabulario, gramática, expresión oral y escrita.',
    color: 'linear-gradient(135deg, #4cc9f0 0%, #0096c7 100%)',
  },
  {
    id: 'FisicaQuimica',
    nombre: 'Física y Química',
    icon: '⚗️',
    descripcion: 'Materia, energía, reacciones químicas y fuerzas.',
    color: 'linear-gradient(135deg, #7209b7 0%, #4a0080 100%)',
  },
  {
    id: 'Tecnologia',
    nombre: 'Tecnología',
    icon: '💻',
    descripcion: 'Programación, robótica, diseño y herramientas digitales.',
    color: 'linear-gradient(135deg, #3d5a80 0%, #1d2d44 100%)',
  },
  {
    id: 'EdFisica',
    nombre: 'Ed. Física',
    icon: '🏃',
    descripcion: 'Salud, condición física, deportes y hábitos activos.',
    color: 'linear-gradient(135deg, #fb8500 0%, #c04a00 100%)',
  },
];

// ── Componente ─────────────────────────────────────────────────────────────────

export default function AsignaturasHome() {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth() as { isSubscribed: boolean };
  const [cursoActivo, setCursoActivo] = useState('1ESO');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7ff', padding: '0 0 3rem' }}>

      {/* Cabecera */}
      <div style={{
        background: 'linear-gradient(120deg, #4361ee, #3a0ca3)',
        color: '#fff',
        padding: '2rem 1.5rem 2.5rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            📚 Asignaturas
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#c8d6ff', fontSize: '0.95rem' }}>
            Apuntes, cuestionarios, tarjetas y vídeos por tema
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Banner plan free */}
        {!isSubscribed && (
          <div style={{
            background: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            color: '#7a5800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            🔒 <span>Plan Gratuito: acceso solo al <strong>Tema 1</strong> de cada asignatura.</span>
            <button
              onClick={() => navigate('/perfil')}
              style={{
                marginLeft: 'auto', background: '#4361ee', color: '#fff',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.8rem',
                fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Actualizar plan
            </button>
          </div>
        )}

        {/* Selector de curso */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', fontWeight: 600 }}>
            CURSO
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CURSOS.map((c) => (
              <button
                key={c}
                onClick={() => setCursoActivo(c)}
                style={{
                  padding: '0.4rem 1.1rem',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: cursoActivo === c ? '#4361ee' : '#d1d5db',
                  background: cursoActivo === c ? '#4361ee' : '#fff',
                  color: cursoActivo === c ? '#fff' : '#374151',
                  fontWeight: cursoActivo === c ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de asignaturas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {ASIGNATURAS.map((asig) => (
            <button
              key={asig.id}
              onClick={() => navigate(`/contenido/${cursoActivo}/${asig.id}`)}
              style={{
                background: asig.color,
                border: 'none',
                borderRadius: '14px',
                padding: '1.5rem 1.25rem 1.25rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.18s, box-shadow 0.18s',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
              }}
            >
              {/* Badge plan free */}
              {!isSubscribed && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.6rem',
                  background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                  borderRadius: '10px', padding: '0.2rem 0.55rem',
                  fontSize: '0.7rem', fontWeight: 700, color: '#ffe082',
                }}>
                  Solo Tema 1
                </span>
              )}

              <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{asig.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>
                {asig.nombre}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>
                {asig.descripcion}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
