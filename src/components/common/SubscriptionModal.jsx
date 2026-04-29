import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayPalSubscription from './PayPalSubscription';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const clientId = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;

  const handleApprove = () => {
    alert('¡Suscripción activada! Bienvenido a SmartStudIA Premium.');
    onClose();
  };

  const handleCancel = () => {
    alert('Has cancelado la suscripción.');
  };

  const handleError = (error) => {
    console.error('Error en PayPal:', error);
    alert('Hubo un error con PayPal. Intenta de nuevo más tarde.');
  };

  const cardBase = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    background: '#3a0ca3',
    border: '2px solid #560bad',
    borderRadius: '14px',
    textAlign: 'center',
    color: '#ffffff',
  };

  const cardPopular = {
    ...cardBase,
    background: '#4361ee',
    border: '2px solid #4cc9f0',
    position: 'relative',
  };

  const textMuted = { fontSize: '0.85rem', color: '#c8d6ff', padding: '0.2rem 0' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 0.4rem' }}>
            Desbloquea todo el contenido
          </h2>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
            Accede a todos los vídeos, PDFs y herramientas de IA sin límites.
          </p>
        </div>

        <PayPalScriptProvider options={{ 'client-id': clientId, intent: 'subscription', vault: true }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>

            {/* Card Mensual */}
            <div style={cardBase}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c8d6ff', marginBottom: '0.3rem' }}>Mensual</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.75rem' }}>
                4,99€<span style={{ fontSize: '0.85rem', color: '#c8d6ff' }}>/mes</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', textAlign: 'left', flex: 1 }}>
                <li style={textMuted}>✓ Acceso completo</li>
                <li style={textMuted}>✓ Herramientas IA</li>
                <li style={textMuted}>✓ Cancela cuando quieras</li>
              </ul>
              <PayPalSubscription
                planId={import.meta.env.VITE_APP_PAYPAL_PLAN_ID_MONTHLY}
                onApprove={handleApprove}
                onCancel={handleCancel}
                onError={handleError}
              />
            </div>

            {/* Card Anual */}
            <div style={cardPopular}>
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: '#fbbf24', color: '#1a1a2e', fontSize: '0.75rem', fontWeight: 700,
                padding: '0.2rem 0.8rem', borderRadius: '20px', whiteSpace: 'nowrap',
              }}>⭐ Más popular</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c8d6ff', marginBottom: '0.3rem', marginTop: '0.6rem' }}>Anual</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.3rem' }}>
                49,99€<span style={{ fontSize: '0.85rem', color: '#c8d6ff' }}>/año</span>
              </div>
              <div style={{
                display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#bbf7d0',
                fontSize: '0.8rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                borderRadius: '6px', marginBottom: '0.75rem',
              }}>¡Ahorras 10€ al año!</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', textAlign: 'left', flex: 1 }}>
                <li style={textMuted}>✓ Todo lo del mensual</li>
                <li style={textMuted}>✓ Precio bloqueado</li>
                <li style={textMuted}>✓ 2 meses gratis</li>
              </ul>
              <PayPalSubscription
                planId={import.meta.env.VITE_APP_PAYPAL_PLAN_ID_ANNUAL}
                onApprove={handleApprove}
                onCancel={handleCancel}
                onError={handleError}
              />
            </div>

          </div>
        </PayPalScriptProvider>

        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' }}>
          Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
