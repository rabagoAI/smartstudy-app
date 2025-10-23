// src/hooks/useRateLimit.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Hook personalizado para implementar rate limiting en llamadas a la API de Gemini
 *
 * Límites implementados:
 * - Free users: 3 llamadas/minuto, 20 llamadas/hora
 * - Premium users: 10 llamadas/minuto, 100 llamadas/hora
 *
 * @param {Object} user - Usuario actual de Firebase Auth
 * @param {boolean} isPremium - Si el usuario tiene suscripción premium
 * @returns {Object} Estado del rate limiting y funciones
 */
export const useRateLimit = (user, isPremium = false) => {
  const [callsThisMinute, setCallsThisMinute] = useState(0);
  const [callsThisHour, setCallsThisHour] = useState(0);
  const [nextResetMinute, setNextResetMinute] = useState(null);
  const [nextResetHour, setNextResetHour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Límites configurables según tipo de usuario
  const LIMITS = {
    free: {
      perMinute: 3,
      perHour: 20
    },
    premium: {
      perMinute: 10,
      perHour: 100
    }
  };

  const limits = isPremium ? LIMITS.premium : LIMITS.free;

  /**
   * Inicializar contadores desde Firestore o localStorage
   */
  useEffect(() => {
    const initializeRateLimit = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const rateLimitRef = doc(db, 'rateLimits', user.uid);
        const rateLimitDoc = await getDoc(rateLimitRef);

        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

        if (rateLimitDoc.exists()) {
          const data = rateLimitDoc.data();
          const lastMinute = data.lastMinuteReset?.toDate() || new Date(0);
          const lastHour = data.lastHourReset?.toDate() || new Date(0);

          // Resetear si es un minuto diferente
          if (lastMinute < currentMinute) {
            setCallsThisMinute(0);
            setNextResetMinute(new Date(currentMinute.getTime() + 60000));
          } else {
            setCallsThisMinute(data.callsThisMinute || 0);
            setNextResetMinute(new Date(lastMinute.getTime() + 60000));
          }

          // Resetear si es una hora diferente
          if (lastHour < currentHour) {
            setCallsThisHour(0);
            setNextResetHour(new Date(currentHour.getTime() + 3600000));
          } else {
            setCallsThisHour(data.callsThisHour || 0);
            setNextResetHour(new Date(lastHour.getTime() + 3600000));
          }
        } else {
          // Primera vez: crear documento
          await setDoc(rateLimitRef, {
            callsThisMinute: 0,
            callsThisHour: 0,
            lastMinuteReset: serverTimestamp(),
            lastHourReset: serverTimestamp(),
            userId: user.uid
          });
          setCallsThisMinute(0);
          setCallsThisHour(0);
          setNextResetMinute(new Date(currentMinute.getTime() + 60000));
          setNextResetHour(new Date(currentHour.getTime() + 3600000));
        }
      } catch (error) {
        console.error('Error al inicializar rate limit desde Firestore:', error);
        // Fallback a localStorage
        const localData = JSON.parse(localStorage.getItem(`rateLimit_${user.uid}`) || '{}');
        const now = Date.now();

        if (localData.lastMinuteReset && now - localData.lastMinuteReset < 60000) {
          setCallsThisMinute(localData.callsThisMinute || 0);
        }
        if (localData.lastHourReset && now - localData.lastHourReset < 3600000) {
          setCallsThisHour(localData.callsThisHour || 0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeRateLimit();
  }, [user]);

  /**
   * Verificar si se puede hacer una llamada
   */
  const canMakeCall = useCallback(() => {
    if (!user) return { allowed: false, reason: 'Usuario no autenticado' };

    if (callsThisMinute >= limits.perMinute) {
      const secondsLeft = Math.ceil((nextResetMinute - new Date()) / 1000);
      return {
        allowed: false,
        reason: `Has alcanzado el límite de ${limits.perMinute} llamadas por minuto. Espera ${secondsLeft} segundos.`,
        limitType: 'minute',
        resetIn: secondsLeft
      };
    }

    if (callsThisHour >= limits.perHour) {
      const minutesLeft = Math.ceil((nextResetHour - new Date()) / 60000);
      return {
        allowed: false,
        reason: `Has alcanzado el límite de ${limits.perHour} llamadas por hora. Espera ${minutesLeft} minutos.`,
        limitType: 'hour',
        resetIn: minutesLeft
      };
    }

    return { allowed: true };
  }, [user, callsThisMinute, callsThisHour, limits, nextResetMinute, nextResetHour]);

  /**
   * Registrar una llamada realizada
   */
  const recordCall = useCallback(async () => {
    if (!user) return;

    const newCallsMinute = callsThisMinute + 1;
    const newCallsHour = callsThisHour + 1;

    setCallsThisMinute(newCallsMinute);
    setCallsThisHour(newCallsHour);

    try {
      const rateLimitRef = doc(db, 'rateLimits', user.uid);
      const now = new Date();
      const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

      await updateDoc(rateLimitRef, {
        callsThisMinute: newCallsMinute,
        callsThisHour: newCallsHour,
        lastMinuteReset: currentMinute,
        lastHourReset: currentHour,
        lastCallTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar rate limit en Firestore:', error);
      // Fallback a localStorage
      localStorage.setItem(`rateLimit_${user.uid}`, JSON.stringify({
        callsThisMinute: newCallsMinute,
        callsThisHour: newCallsHour,
        lastMinuteReset: Date.now(),
        lastHourReset: Date.now()
      }));
    }
  }, [user, callsThisMinute, callsThisHour]);

  /**
   * Resetear contadores manualmente (útil para testing)
   */
  const resetLimits = useCallback(async () => {
    if (!user) return;

    setCallsThisMinute(0);
    setCallsThisHour(0);

    try {
      const rateLimitRef = doc(db, 'rateLimits', user.uid);
      await updateDoc(rateLimitRef, {
        callsThisMinute: 0,
        callsThisHour: 0,
        lastMinuteReset: serverTimestamp(),
        lastHourReset: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al resetear limits:', error);
    }
  }, [user]);

  return {
    // Estado
    callsThisMinute,
    callsThisHour,
    remainingCallsMinute: Math.max(0, limits.perMinute - callsThisMinute),
    remainingCallsHour: Math.max(0, limits.perHour - callsThisHour),
    limits,
    isLoading,
    nextResetMinute,
    nextResetHour,

    // Funciones
    canMakeCall,
    recordCall,
    resetLimits,

    // Info
    isPremium
  };
};

export default useRateLimit;
