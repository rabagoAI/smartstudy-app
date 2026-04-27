// src/components/common/PayPalSubscription.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { auth, db } from '../../firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { trackEvent } from '../../analytics';

const PayPalSubscription = ({ onApprove, onCancel, onError, planId: planIdProp }) => {
  const planId = planIdProp || import.meta.env.VITE_APP_PAYPAL_PLAN_ID;
  const clientId = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;

  if (!planId || !clientId) {
    console.error('CRITICAL: PayPal Env vars missing');
    return <div className="text-red-500">Error de configuración de pagos.</div>;
  }

  const initialOptions = {
    'client-id': clientId,
    'enable-funding': 'venmo',
    intent: 'subscription',
    vault: true
  };

  const logError = async (context, errorDetails) => {
    console.error(`❌ PayPal Error [${context}]:`, errorDetails);

    // 1. Google Analytics
    trackEvent('payment', 'error', `${context}: ${errorDetails.message || errorDetails}`);

    // 2. Firestore Logging (Monitoring Dashboard)
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'transaction_logs'), {
        type: 'ERROR',
        context: context,
        planId: planId,
        uid: user ? user.uid : 'anonymous',
        email: user ? user.email : 'unknown',
        error: typeof errorDetails === 'object' ? JSON.stringify(errorDetails, Object.getOwnPropertyNames(errorDetails)) : errorDetails,
        timestamp: new Date()
      });
    } catch (logErr) {
      console.error('Failed to log payment error to Firestore:', logErr);
    }
  };

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      'plan_id': planId
    });
  };

  const onSubscriptionApprove = async (data, actions) => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Log transaction start
        trackEvent('payment', 'subscription_approved_start', data.subscriptionID);

        await updateDoc(doc(db, "users", user.uid), {
          subscription: 'premium',
          subscriptionID: data.subscriptionID,
          subscriptionStartDate: new Date(),
        });

        // Log Success
        await addDoc(collection(db, 'transaction_logs'), {
          type: 'SUCCESS',
          uid: user.uid,
          subscriptionId: data.subscriptionID,
          timestamp: new Date()
        });

        if (onApprove) onApprove(data.subscriptionID);
      } else {
        throw new Error('User not authenticated during payment approval');
      }
    } catch (error) {
      logError('Approval_Update', error);
      if (onError) onError(error);
      else alert('Tu pago se procesó, pero hubo un error actualizando tu perfil. Contacta a soporte.');
    }
  };

  const handleCancel = (data) => {
    trackEvent('payment', 'cancelled', data.orderID);
    if (onCancel) onCancel(data);
  };

  const handleError = (error) => {
    logError('Button_Error', error);
    if (onError) onError(error);
    else alert('Error de conexión con PayPal. Por favor, recarga y reintenta.');
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
            height: 48
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