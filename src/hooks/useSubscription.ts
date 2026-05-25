import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
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

export function useSubscription(): SubscriptionState {
  const { currentUser } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    premium: false,
    subscriptionStatus: null,
    aiUsageThisMonth: 0,
    aiUsageLimit: AI_USAGE_LIMITS.free,
    trialEnd: null,
    loading: true,
  });

  useEffect(() => {
    if (!currentUser) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snap) => {
        if (!snap.exists()) {
          setState(s => ({ ...s, loading: false }));
          return;
        }

        const data = snap.data();
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

        const trialEnd = data.trialEnd ? new Date(data.trialEnd.toDate?.() ?? data.trialEnd) : null;

        setState({
          plan,
          premium,
          subscriptionStatus,
          aiUsageThisMonth,
          aiUsageLimit,
          trialEnd,
          loading: false,
        });
      },
      (err) => {
        console.error('useSubscription error:', err);
        setState(s => ({ ...s, loading: false }));
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  return state;
}
