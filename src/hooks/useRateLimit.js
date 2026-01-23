import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DEFAULT_LIMITS = {
  free: { perMinute: 5, perHour: 20 },
  premium: { perMinute: 20, perHour: 100 }
};

const useRateLimit = (currentUser, isPremium = false) => {
  const [limits, setLimits] = useState(isPremium ? DEFAULT_LIMITS.premium : DEFAULT_LIMITS.free);

  // Contadores en memoria (inicializados desde localStorage si es posible)
  const [callsMinute, setCallsMinute] = useState(0);
  const [callsHour, setCallsHour] = useState(0);

  // Timestamps para reseteo
  const [resetMinute, setResetMinute] = useState(Date.now() + 60000);
  const [resetHour, setResetHour] = useState(Date.now() + 3600000);

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    if (!currentUser) return;

    const loadLocalState = () => {
      const storedMinute = localStorage.getItem(`rate_limit_minute_${currentUser.uid}`);
      const storedHour = localStorage.getItem(`rate_limit_hour_${currentUser.uid}`);
      const storedResetMinute = localStorage.getItem(`rate_limit_reset_minute_${currentUser.uid}`);
      const storedResetHour = localStorage.getItem(`rate_limit_reset_hour_${currentUser.uid}`);

      const now = Date.now();

      if (storedResetMinute && parseInt(storedResetMinute) > now) {
        setCallsMinute(parseInt(storedMinute || '0'));
        setResetMinute(parseInt(storedResetMinute));
      } else {
        setCallsMinute(0);
        setResetMinute(now + 60000);
      }

      if (storedResetHour && parseInt(storedResetHour) > now) {
        setCallsHour(parseInt(storedHour || '0'));
        setResetHour(parseInt(storedResetHour));
      } else {
        setCallsHour(0);
        setResetHour(now + 3600000);
      }
    };

    loadLocalState();
  }, [currentUser]);

  // Actualizar localStorage cuando cambia el estado
  useEffect(() => {
    if (!currentUser) return;

    localStorage.setItem(`rate_limit_minute_${currentUser.uid}`, callsMinute.toString());
    localStorage.setItem(`rate_limit_hour_${currentUser.uid}`, callsHour.toString());
    localStorage.setItem(`rate_limit_reset_minute_${currentUser.uid}`, resetMinute.toString());
    localStorage.setItem(`rate_limit_reset_hour_${currentUser.uid}`, resetHour.toString());
  }, [callsMinute, callsHour, resetMinute, resetHour, currentUser]);

  // Verificar si se puede realizar una llamada
  const checkLimit = useCallback(async () => {
    if (!currentUser) return false;

    const now = Date.now();

    // Reseteos automáticos si ha pasado el tiempo
    if (now > resetMinute) {
      setCallsMinute(0);
      setResetMinute(now + 60000);
    }
    if (now > resetHour) {
      setCallsHour(0);
      setResetHour(now + 3600000);
    }

    if (callsMinute >= limits.perMinute) {
      return { allowed: false, error: 'Has excedido el límite por minuto. Espera un momento.' };
    }
    if (callsHour >= limits.perHour) {
      return { allowed: false, error: 'Has excedido el límite por hora. Vuelve más tarde.' };
    }

    return { allowed: true };
  }, [callsMinute, callsHour, limits, resetMinute, resetHour, currentUser]);

  // Incrementar contador
  const incrementCount = useCallback(async () => {
    if (!currentUser) return;

    setCallsMinute(prev => prev + 1);
    setCallsHour(prev => prev + 1);

    // Intentar sincronizar con Firestore (opcional, para auditoría)
    try {
      const usageRef = doc(db, 'user_usage', currentUser.uid);
      await setDoc(usageRef, {
        lastUsed: serverTimestamp(),
        callsMinute: callsMinute + 1,
        callsHour: callsHour + 1
      }, { merge: true });
    } catch (error) {
      console.warn('Error syncing usage to Firestore:', error);
      // No bloqueamos la UI si falla la sincronización remota
    }
  }, [callsMinute, callsHour, currentUser]);

  return {
    remainingCallsMinute: Math.max(0, limits.perMinute - callsMinute),
    remainingCallsHour: Math.max(0, limits.perHour - callsHour),
    limits,
    nextResetMinute: new Date(resetMinute),
    checkLimit,
    incrementCount
  };
};

export default useRateLimit;
