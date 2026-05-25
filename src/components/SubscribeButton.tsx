import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SubscribeButtonProps {
  planId: string;
  label?: string;
  className?: string;
}

export default function SubscribeButton({
  planId,
  label = 'Suscribirse',
  className = '',
}: SubscribeButtonProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: currentUser.email, planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error creando sesión de pago');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`btn btn-primary ${className}`}
        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Redirigiendo...' : label}
      </button>
      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>
      )}
    </div>
  );
}
