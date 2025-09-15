// src/components/common/SubscriptionModal.js

import React from 'react';

const SubscriptionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>¡Suscríbete para acceder a todo el contenido!</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <p className="modal-description">
          Con nuestra suscripción premium, desbloqueas todos los videos, PDFs y herramientas exclusivas.
        </p>

        {/* Planes */}
        <div className="plans-container">
          <div className="plan-card">
            <h4>Mensual</h4>
            <div className="price">4,99€/mes</div>
            <button className="btn btn-secondary">Suscribirse</button>
          </div>
          <div className="plan-card popular">
            <div className="badge">⭐ Más popular</div>
            <h4>Anual</h4>
            <div className="price">49,99€/año</div>
            <div className="saving">¡Ahorras 10€ al año!</div>
            <button className="btn btn-primary">Suscribirse</button>
          </div>
        </div>

        <p className="small-text">
          Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;