// src/components/common/ErrorBoundary.jsx
import React from 'react';
import ErrorFallback from './ErrorFallback';

/**
 * Error Boundary component para capturar errores de React
 * Los Error Boundaries solo pueden ser componentes de clase
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar el fallback UI en el próximo render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes loguear el error a un servicio de reporting como Sentry
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // TODO: Enviar a servicio de monitoring (ej. Sentry, LogRocket)
    // if (import.meta.env.PROD) {
    //   logErrorToService(error, errorInfo);
    // }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de fallback
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          {...this.props}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
