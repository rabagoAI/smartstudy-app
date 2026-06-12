import { useSubscription } from './useSubscription';

// El conteo y la aplicación de la cuota mensual de IA viven en el servidor
// (api/gemini.js), que es la única fuente de verdad y no se puede evadir.
// El cliente NO escribe el contador: solo lee el estado actual para la UI.
// Si el límite se supera, /api/gemini responde 429 con reason: 'monthly_limit'.
export function useAiUsage() {
  const { aiUsageThisMonth, aiUsageLimit } = useSubscription();

  return {
    aiUsageThisMonth,
    aiUsageLimit,
    remaining: Math.max(0, aiUsageLimit - aiUsageThisMonth),
  };
}
