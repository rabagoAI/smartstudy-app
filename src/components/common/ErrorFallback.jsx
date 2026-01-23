// src/components/common/ErrorFallback.jsx
import React from 'react';
import './ErrorFallback.css';

/**
 * Componente de UI que se muestra cuando hay un error
 * @param {Object} props
 * @param {Error} props.error - El error capturado
 * @param {Object} props.errorInfo - Información adicional del error
 * @param {Function} props.resetErrorBoundary - Función para resetear el error
 * @param {boolean} props.fullPage - Si debe ocupar toda la página (default: true)
 */
const ErrorFallback = ({
  error,
  errorInfo,
  resetErrorBoundary,
  fullPage = true,
  retryCount = 0,
  maxRetries = 2
}) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    // Si es un error global, recargar la página
    if (fullPage) {
      window.location.reload();
    }
  };

  const isProduction = import.meta.env.PROD;
  const isRetrying = retryCount < maxRetries;

  return (
    <div className={`error-fallback ${fullPage ? 'error-fallback--fullpage' : ''}`}>
      <div className="error-fallback__container">
        <div className="error-fallback__icon">⚠️</div>

        <h1 className="error-fallback__title">
          {isRetrying ? 'Reconectando...' : '¡Ups! Algo salió mal'}
        </h1>

        <p className="error-fallback__description">
          {isRetrying
            ? `Detectamos un problema. Reintentando automáticamente (Intento ${retryCount + 1})...`
            : 'Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.'
          }
        </p>

        {/* Mostrar detalles del error solo en desarrollo y si no está reintentando (o si, para debug) */}
        {!isProduction && error && (
          <details className="error-fallback__details">
            <summary>Detalles técnicos (solo visible en desarrollo)</summary>
            {/* ... rest of details ... */}
            <div className="error-fallback__error-info">
              <p><strong>Retry Count:</strong> {retryCount}</p>
              <p><strong>Error:</strong> {error.toString()}</p>
              {errorInfo && errorInfo.componentStack && (
                <pre className="error-fallback__stack">
                  <strong>Component Stack:</strong>
                  {errorInfo.componentStack}
                </pre>
              )}
              {error.stack && (
                <pre className="error-fallback__stack">
                  <strong>Stack Trace:</strong>
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="error-fallback__actions">
          {!isRetrying && (
            <>
              <button
                onClick={handleReload}
                className="error-fallback__button error-fallback__button--primary"
              >
                Reintentar ahora
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="error-fallback__button error-fallback__button--secondary"
              >
                Ir a inicio
              </button>
            </>
          )}
          {isRetrying && (
            <div className="error-fallback__loading">
              {/* Spinner could go here */}
              <span className="animate-pulse">⏳ Procesando...</span>
            </div>
          )}
        </div>

        <p className="error-fallback__help">
          Si el problema persiste, contáctanos en{' '}
          <a href="mailto:soporte@smartstudia.com">soporte@smartstudia.com</a>
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
