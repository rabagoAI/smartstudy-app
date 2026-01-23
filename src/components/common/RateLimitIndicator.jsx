// src/components/common/RateLimitIndicator.jsx
import React from 'react';
import { useRateLimitStatus } from '../../hooks/useRateLimitStatus';
import './RateLimitIndicator.css';

/**
 * Componente que muestra visualmente el estado del rate limiting
 * @param {Object} props
 * @param {number} props.remainingCallsMinute - Llamadas restantes este minuto
 * @param {number} props.remainingCallsHour - Llamadas restantes esta hora
 * @param {Object} props.limits - Límites configurados (perMinute, perHour)
 * @param {Date} props.nextResetMinute - Cuando se resetea el límite por minuto
 * @param {Date} props.nextResetHour - Cuando se resetea el límite por hora
 * @param {boolean} props.isPremium - Si el usuario es premium
 * @param {boolean} props.compact - Modo compacto (opcional)
 */
const RateLimitIndicator = ({
  remainingCallsMinute,
  remainingCallsHour,
  limits,
  nextResetMinute,
  nextResetHour,
  isPremium = false,
  compact = false
}) => {
  const {
    timeUntilReset,
    minutePercentage,
    hourPercentage,
    minuteColor,
    hourColor
  } = useRateLimitStatus({
    remainingCallsMinute,
    remainingCallsHour,
    limits,
    nextResetMinute
  });

  if (compact) {
    return (
      <div className="rate-limit-indicator rate-limit-indicator--compact">
        <div className="rate-limit-badge">
          <span className={`badge badge--${minuteColor}`}>
            {remainingCallsMinute}/{limits.perMinute} disponibles
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rate-limit-indicator ${isPremium ? 'rate-limit-indicator--premium' : ''}`}>
      <div className="rate-limit-header">
        <h4>
          {isPremium ? '⭐ Límites Premium' : '📊 Límites de Uso'}
        </h4>
        {isPremium && (
          <span className="premium-badge">Premium</span>
        )}
      </div>

      <div className="rate-limit-stats">
        {/* Límite por minuto */}
        <div className="rate-limit-stat">
          <div className="rate-limit-stat__header">
            <span className="rate-limit-stat__label">Por minuto</span>
            <span className={`rate-limit-stat__value rate-limit-stat__value--${minuteColor}`}>
              {remainingCallsMinute} / {limits.perMinute}
            </span>
          </div>
          <div className="rate-limit-progress">
            <div
              className={`rate-limit-progress__bar rate-limit-progress__bar--${minuteColor}`}
              style={{ width: `${minutePercentage}%` }}
            />
          </div>
          {remainingCallsMinute === 0 && (
            <p className="rate-limit-reset">Resetea en: {timeUntilReset}</p>
          )}
        </div>

        {/* Límite por hora */}
        <div className="rate-limit-stat">
          <div className="rate-limit-stat__header">
            <span className="rate-limit-stat__label">Por hora</span>
            <span className={`rate-limit-stat__value rate-limit-stat__value--${hourColor}`}>
              {remainingCallsHour} / {limits.perHour}
            </span>
          </div>
          <div className="rate-limit-progress">
            <div
              className={`rate-limit-progress__bar rate-limit-progress__bar--${hourColor}`}
              style={{ width: `${hourPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mensaje de upgrade para usuarios free */}
      {!isPremium && (minutePercentage > 50 || hourPercentage > 50) && (
        <div className="rate-limit-upgrade">
          <p>¿Necesitas más llamadas? 🚀</p>
          <a href="/perfil" className="rate-limit-upgrade__link">
            Actualiza a Premium
          </a>
        </div>
      )}

      {/* Advertencia cuando se acerca al límite */}
      {remainingCallsMinute <= 1 && remainingCallsMinute > 0 && (
        <div className="rate-limit-warning">
          ⚠️ Te queda solo 1 llamada este minuto
        </div>
      )}

      {remainingCallsHour <= 5 && remainingCallsHour > 0 && (
        <div className="rate-limit-warning">
          ⚠️ Te quedan solo {remainingCallsHour} llamadas esta hora
        </div>
      )}
    </div>
  );
};

export default RateLimitIndicator;
