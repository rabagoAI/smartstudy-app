// src/components/common/PayPalSubscription.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PayPalSubscription = ({ onApprove, onCancel, onError }) => {
  // ✅ Usa el plan_id desde las variables de entorno
  const planId = process.env.REACT_APP_PAYPAL_PLAN_ID;

  // ✅ Verifica que el plan_id esté definido
  if (!planId) {
    console.error('Error: REACT_APP_PAYPAL_PLAN_ID no está definido');
    return <div>Error: Configuración de PayPal incompleta</div>;
  }

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: planId, // ✅ Usa la variable de entorno
    });
  };

  const onSubscriptionApprove = async (data, actions) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          subscriptionStatus: 'premium',
          subscriptionID: data.subscriptionID,
          subscriptionStartDate: new Date(),
        });
        if (onApprove) {
          onApprove(data.subscriptionID);
        }
      } else {
        throw new Error('Usuario no autenticado');
      }
    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      if (onError) {
        onError(error);
      } else {
        alert('Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleCancel = (data, actions) => {
    console.log('Pago cancelado:', data);
    if (onCancel) {
      onCancel(data);
    } else {
      alert('Has cancelado el proceso de suscripción.');
    }
  };

  const handleError = (error) => {
    console.error('Error en PayPal:', error);
    if (onError) {
      onError(error);
    } else {
      alert('Hubo un error con PayPal. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="paypal-container">
      <PayPalScriptProvider
        options={{
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
          intent: 'subscription',
          vault: true,
          // ✅ Añade modo sandbox para desarrollo
          ...(process.env.NODE_ENV === 'development' && {
            'data-client-token': 'sandbox',
            components: 'buttons'
          })
        }}
      >
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