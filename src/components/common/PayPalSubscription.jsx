import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { auth, db } from '../../firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { trackEvent } from '../../analytics';

const PayPalSubscription = ({ onApprove, onCancel, onError, planId: planIdProp }) => {
  const planId = planIdProp || import.meta.env.VITE_APP_PAYPAL_PLAN_ID;

  if (!planId) {
    console.error('CRITICAL: PayPal planId missing');
    return <div style={{ color: '#f87171', fontSize: '0.85rem' }}>Error de configuración.</div>;
  }

  const logError = async (context, errorDetails) => {
    console.error(`❌ PayPal Error [${context}]:`, errorDetails);
    trackEvent('payment', 'error', `${context}: ${errorDetails.message || errorDetails}`);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'transaction_logs'), {
        type: 'ERROR',
        context,
        planId,
        uid: user ? user.uid : 'anonymous',
        email: user ? user.email : 'unknown',
        error: typeof errorDetails === 'object'
          ? JSON.stringify(errorDetails, Object.getOwnPropertyNames(errorDetails))
          : errorDetails,
        timestamp: new Date()
      });
    } catch (logErr) {
      console.error('Failed to log payment error to Firestore:', logErr);
    }
  };

  const createSubscription = (data, actions) =>
    actions.subscription.create({ plan_id: planId });

  const onSubscriptionApprove = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated during payment approval');

      trackEvent('payment', 'subscription_approved_start', data.subscriptionID);

      await updateDoc(doc(db, 'users', user.uid), {
        subscription: 'premium',
        subscriptionID: data.subscriptionID,
        subscriptionStartDate: new Date(),
      });

      await addDoc(collection(db, 'transaction_logs'), {
        type: 'SUCCESS',
        uid: user.uid,
        subscriptionId: data.subscriptionID,
        timestamp: new Date()
      });

      if (onApprove) onApprove(data.subscriptionID);
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
    <div>
      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'subscribe', color: 'blue', height: 45 }}
        createSubscription={createSubscription}
        onApprove={onSubscriptionApprove}
        onCancel={handleCancel}
        onError={handleError}
      />
    </div>
  );
};

export default PayPalSubscription;
