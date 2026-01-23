// src/components/common/ErrorBoundary.jsx
import React from 'react';
import ErrorFallback from './ErrorFallback';
import * as Sentry from "@sentry/react";

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
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para mostrar el fallback UI en el próximo render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Loguear a Sentry
    Sentry.captureException(error, { extra: errorInfo });
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Auto-retry logic
    const MAX_RETRIES = 2;
    if (this.state.retryCount < MAX_RETRIES) {
      if (this.retryTimeout) clearTimeout(this.retryTimeout);

      this.retryTimeout = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, 2000); // Reintentar después de 2 segundos
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
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
          retryCount={this.state.retryCount}
          maxRetries={2}
          {...this.props}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
