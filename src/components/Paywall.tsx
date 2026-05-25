import React from 'react';
import SubscribeButton from './SubscribeButton';

interface PaywallProps {
  reason?: 'premium_content' | 'ai_limit';
}

export default function Paywall({ reason = 'premium_content' }: PaywallProps) {
  const isAiLimit = reason === 'ai_limit';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '1rem', padding: '2rem 1.5rem', borderRadius: '16px',
      background: 'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
      color: '#fff', textAlign: 'center', maxWidth: '420px', margin: '2rem auto',
      boxShadow: '0 8px 32px rgba(67,97,238,0.25)',
    }}>
      <div style={{ fontSize: '2.5rem' }}>{isAiLimit ? '🤖' : '🔒'}</div>

      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
        {isAiLimit ? 'Límite de IA alcanzado' : 'Contenido Premium'}
      </h3>

      <p style={{ margin: 0, color: '#c8d6ff', fontSize: '0.95rem', lineHeight: 1.5 }}>
        {isAiLimit
          ? 'Has usado todos tus créditos de IA este mes. Actualiza al Plan Básico para obtener 20 usos al mes.'
          : 'Este contenido es exclusivo del Plan Básico. Desbloquea todos los apuntes, vídeos y exámenes resueltos.'}
      </p>

      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        textAlign: 'left', color: '#e0e7ff', fontSize: '0.88rem', width: '100%',
      }}>
        <li>✓ Contenido completo del curso</li>
        <li>✓ 20 usos de Herramientas IA al mes</li>
        <li>✓ 14 días de prueba gratis, sin tarjeta</li>
        <li>✓ Cancela cuando quieras</li>
      </ul>

      <div style={{ width: '100%', marginTop: '0.5rem' }}>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem',
        }}>
          4,99€<span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#c8d6ff' }}>/mes</span>
        </div>
        <SubscribeButton
          planId="basic"
          label="Empezar prueba gratuita"
          className="paywall-cta"
        />
      </div>

      <p style={{ margin: 0, color: '#9db4ff', fontSize: '0.78rem' }}>
        Sin compromiso · Cancela en cualquier momento
      </p>
    </div>
  );
}
