// src/components/common/SubscriptionModal.js

import React, { useState } from 'react';
import PayPalSubscription from './PayPalSubscription';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose }) => {
  const handleApprove = (subscriptionID) => {
    alert('¡Suscripción activada! Bienvenido a SmartStudy Premium.');
    onClose();
  };

  const handleCancel = () => {
    alert('Has cancelado la suscripción.');
  };

  const handleError = (error) => {
    console.error('Error en PayPal:', error);
    alert('Hubo un error con PayPal. Intenta de nuevo más tarde.');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2>¡Suscríbete para acceder a todo el contenido!</h2>
        <p>Con nuestra suscripción premium, desbloqueas todos los videos, PDFs y herramientas exclusivas.</p>

        <div className="plans-container">
          <div className="plan-card">
            <h4>Mensual</h4>
            <p>4,99€/mes</p>
            <PayPalSubscription
              onApprove={handleApprove}
              onCancel={handleCancel}
              onError={handleError}
            />
          </div>
          <div className="plan-card popular">
            <div className="badge">⭐ Más popular</div>
            <h4>Anual</h4>
            <p>49,99€/año</p>
            <div className="saving">¡Ahorras 10€ al año!</div>
            <PayPalSubscription
              onApprove={handleApprove}
              onCancel={handleCancel}
              onError={handleError}
            />
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