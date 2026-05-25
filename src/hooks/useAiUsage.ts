import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from './useSubscription';

export type UsageCheckResult =
  | { allowed: true }
  | { allowed: false; reason: 'limit_reached' | 'not_authenticated' };

export function useAiUsage() {
  const { currentUser } = useAuth();
  const { aiUsageThisMonth, aiUsageLimit } = useSubscription();

  const checkAndIncrementUsage = async (): Promise<UsageCheckResult> => {
    if (!currentUser) {
      return { allowed: false, reason: 'not_authenticated' };
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const now = new Date();
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

    try {
      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) return { allowed: false, reason: 'not_authenticated' as const };

        const data = snap.data();
        const plan: 'free' | 'basic' = data.plan === 'basic' ? 'basic' : 'free';
        const limit = plan === 'basic' ? 20 : 3;

        const storedMonth: number = data.aiUsageMonth ?? 0;
        const usage: number =
          storedMonth === currentMonth ? (data.aiUsageThisMonth ?? 0) : 0;

        if (usage >= limit) {
          return { allowed: false, reason: 'limit_reached' as const };
        }

        tx.set(
          userRef,
          {
            aiUsageThisMonth: usage + 1,
            aiUsageMonth: currentMonth,
            aiUsageUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        return { allowed: true as const };
      });

      return result;
    } catch (err) {
      console.error('useAiUsage transaction error:', err);
      // En caso de error de Firestore, permitimos la llamada para no bloquear al usuario
      return { allowed: true };
    }
  };

  return {
    checkAndIncrementUsage,
    aiUsageThisMonth,
    aiUsageLimit,
  };
}
