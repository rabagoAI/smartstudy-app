// src/components/common/PayPalSubscription.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PayPalSubscription = ({ onApprove, onCancel, onError }) => {
  // ✅ Usa el plan_id desde las variables de entorno
  const planId = import.meta.env.VITE_APP_PAYPAL_PLAN_ID;
  const clientId = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;

  // 🔍 Debug temporal - ELIMINAR EN PRODUCCIÓN
  console.log('🔍 Plan ID:', planId);
  console.log('🔍 Client ID:', clientId);
  console.log('🔍 Node ENV:', import.meta.env.NODE_ENV);

  // ✅ Verifica que las variables estén definidas
  if (!planId || !clientId) {
    console.error('Error: Variables de entorno de PayPal no están definidas');
    console.error('Plan ID:', planId);
    console.error('Client ID:', clientId);
    return (
      <div style={{color: 'red', padding: '10px', border: '1px solid red'}}>
        Error: Configuración de PayPal incompleta. Revisa las variables de entorno.
      </div>
    );
  }

  // ✅ Configuración correcta de PayPal
  const initialOptions = {
    'client-id': clientId,
    'enable-funding': 'venmo',
    'disable-funding': '',
    'data-sdk-integration-source': 'integrationbuilder_sc',
    intent: 'subscription',
    vault: true
  };

  const createSubscription = (data, actions) => {
    console.log('🚀 Creando suscripción con Plan ID:', planId);
    
    return actions.subscription.create({
      'plan_id': planId
    });
  };

  const onSubscriptionApprove = async (data, actions) => {
    console.log('✅ Suscripción aprobada:', data);
    
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          subscriptionStatus: 'premium',
          subscriptionID: data.subscriptionID,
          subscriptionStartDate: new Date(),
        });
        
        console.log('✅ Usuario actualizado con suscripción premium');
        
        if (onApprove) {
          onApprove(data.subscriptionID);
        }
      } else {
        throw new Error('Usuario no autenticado');
      }
    } catch (error) {
      console.error('❌ Error al actualizar la suscripción:', error);
      if (onError) {
        onError(error);
      } else {
        alert('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleCancel = (data, actions) => {
    console.log('❌ Pago cancelado:', data);
    if (onCancel) {
      onCancel(data);
    } else {
      alert('Has cancelado el proceso de suscripción.');
    }
  };

  const handleError = (error) => {
    console.error('❌ Error en PayPal:', error);
    if (onError) {
      onError(error);
    } else {
      alert('Hubo un error con PayPal. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="paypal-container">
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ 
            layout: 'vertical', 
            shape: 'rect', 
            label: 'subscribe',
            color: 'blue',
            height: 48,
            tagline: false
          }}
          createSubscription={createSubscription}
          onApprove={onSubscriptionApprove}
          onCancel={handleCancel}
          onError={handleError}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalSubscription;