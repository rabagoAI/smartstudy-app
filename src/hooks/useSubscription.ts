import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export type Plan = 'free' | 'basic';
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | null;

const AI_USAGE_LIMITS: Record<Plan, number> = {
  free: 3,
  basic: 20,
};

export interface SubscriptionState {
  plan: Plan;
  premium: boolean;
  subscriptionStatus: SubscriptionStatus;
  aiUsageThisMonth: number;
  aiUsageLimit: number;
  trialEnd: Date | null;
  loading: boolean;
}

// Estado de suscripción derivado del documento de usuario que ya mantiene
// AuthContext (única fuente de verdad). NO abre su propio listener de Firestore:
// reutiliza userData para evitar lecturas duplicadas y desincronización entre
// `isSubscribed` (AuthContext) y este hook.
export function useSubscription(): SubscriptionState {
  const { userData, currentUser, loading } = useAuth() as {
    userData: Record<string, any> | null;
    currentUser: any;
    loading: boolean;
  };

  return useMemo<SubscriptionState>(() => {
    if (!currentUser || !userData) {
      return {
        plan: 'free',
        premium: false,
        subscriptionStatus: null,
        aiUsageThisMonth: 0,
        aiUsageLimit: AI_USAGE_LIMITS.free,
        trialEnd: null,
        loading,
      };
    }

    const data = userData;
    const plan: Plan = data.plan === 'basic' ? 'basic' : 'free';
    const premium: boolean = data.premium === true;
    const subscriptionStatus: SubscriptionStatus = data.subscriptionStatus ?? null;
    const aiUsageLimit = AI_USAGE_LIMITS[plan];

    // Resetear contador mensual si ha pasado el mes
    const now = new Date();
    const usageMonth: number = data.aiUsageMonth ?? 0;
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);
    const aiUsageThisMonth =
      usageMonth === currentMonth ? (data.aiUsageThisMonth ?? 0) : 0;

    const trialEnd = data.trialEnd
      ? new Date(data.trialEnd.toDate?.() ?? data.trialEnd)
      : null;

    return {
      plan,
      premium,
      subscriptionStatus,
      aiUsageThisMonth,
      aiUsageLimit,
      trialEnd,
      loading: false,
    };
  }, [userData, currentUser, loading]);
}
