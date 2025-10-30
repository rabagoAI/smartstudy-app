// src/components/common/ErrorTest.jsx
// Componente de prueba para verificar Error Boundaries
// ELIMINAR ESTE ARCHIVO DESPUÉS DE PROBAR

import React, { useState } from 'react';

const ErrorTest = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('¡Error de prueba lanzado intencionalmente! El Error Boundary debería capturar esto.');
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Componente de Prueba de Error Boundary</h2>
      <p>Haz clic en el botón para lanzar un error y verificar que el Error Boundary lo captura:</p>
      <button
        onClick={() => setShouldThrow(true)}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Lanzar Error de Prueba
      </button>
    </div>
  );
};

export default ErrorTest;
