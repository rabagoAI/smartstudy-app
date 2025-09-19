// src/components/common/PayPalSubscription.js

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PayPalSubscription = ({ onApprove, onCancel, onError }) => {
  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: 'P-123456789ABC', // ✅ REEMPLAZA ESTO con tu ID de plan real
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
      }
    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className="paypal-container">
      <PayPalScriptProvider
        options={{
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
          intent: 'subscription',
          vault: true,
        }}
      >
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
          onCancel={onCancel}
          onError={onError}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalSubscription;