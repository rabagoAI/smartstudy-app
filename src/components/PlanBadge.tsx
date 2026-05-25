import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PlanBadge() {
  const { plan, premium, subscriptionStatus, trialEnd, loading } = useSubscription();

  if (loading) return null;

  if (subscriptionStatus === 'trialing' && trialEnd) {
    const days = daysUntil(trialEnd);
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.2rem 0.7rem', borderRadius: '999px',
        background: '#fef3c7', color: '#92400e', fontSize: '0.78rem', fontWeight: 600,
      }}>
        Trial · {days}d restantes
      </span>
    );
  }

  if (premium && plan === 'basic') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.2rem 0.7rem', borderRadius: '999px',
        background: '#ede9fe', color: '#5b21b6', fontSize: '0.78rem', fontWeight: 600,
      }}>
        ⭐ Básico
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.7rem', borderRadius: '999px',
      background: '#f3f4f6', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600,
    }}>
      Gratis
    </span>
  );
}
