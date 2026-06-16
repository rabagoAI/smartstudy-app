import { describe, it, expect, vi } from 'vitest';
import { handleStripeEvent, trialEndToDate } from './stripeWebhook';

// ── Mocks ligeros de Firestore Admin y Stripe ──────────────────────────────────

// Crea un Firestore falso que registra cada .set() (por doc directo o por query).
// `lookupDocs` simula el resultado de where(...).limit(1).get().
function makeMockDb(lookupDocs: { path: string }[] = []) {
  const setCalls: { path: string; data: Record<string, unknown>; opts: unknown }[] = [];

  const db = {
    collection(name: string) {
      return {
        doc(id: string) {
          return {
            set: async (data: Record<string, unknown>, opts: unknown) => {
              setCalls.push({ path: `${name}/${id}`, data, opts });
            },
          };
        },
        where() {
          return {
            limit() {
              return {
                get: async () => ({
                  empty: lookupDocs.length === 0,
                  docs: lookupDocs.map((d) => ({
                    ref: {
                      set: async (data: Record<string, unknown>, opts: unknown) => {
                        setCalls.push({ path: d.path, data, opts });
                      },
                    },
                  })),
                }),
              };
            },
          };
        },
      };
    },
  };

  return { db, setCalls };
}

function makeStripe(subscription: Record<string, unknown>) {
  return {
    subscriptions: {
      retrieve: vi.fn(async () => subscription),
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asEvent = (e: unknown) => e as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asDb = (d: unknown) => d as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asStripe = (s: unknown) => s as any;

describe('trialEndToDate', () => {
  it('convierte epoch (segundos) a Date', () => {
    const d = trialEndToDate(1_700_000_000);
    expect(d).toBeInstanceOf(Date);
    expect(d!.getTime()).toBe(1_700_000_000 * 1000);
  });

  it('devuelve null para null/undefined/0', () => {
    expect(trialEndToDate(null)).toBeNull();
    expect(trialEndToDate(undefined)).toBeNull();
    expect(trialEndToDate(0)).toBeNull();
  });
});

describe('handleStripeEvent — checkout.session.completed', () => {
  it('marca premium y escribe los campos de Stripe en el uid del metadata', async () => {
    const { db, setCalls } = makeMockDb();
    const stripe = makeStripe({ id: 'sub_123', status: 'trialing', trial_end: 1_700_000_000 });

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { firebaseUid: 'user_abc' },
          subscription: 'sub_123',
          customer: 'cus_xyz',
        },
      },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(stripe));

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
    expect(setCalls).toHaveLength(1);
    expect(setCalls[0].path).toBe('users/user_abc');
    expect(setCalls[0].opts).toEqual({ merge: true });
    expect(setCalls[0].data).toMatchObject({
      premium: true,
      plan: 'basic',
      stripeCustomerId: 'cus_xyz',
      subscriptionId: 'sub_123',
      subscriptionStatus: 'trialing',
    });
    expect(setCalls[0].data.trialEnd).toBeInstanceOf(Date);
  });

  it('no escribe nada si falta firebaseUid en el metadata', async () => {
    const { db, setCalls } = makeMockDb();
    const stripe = makeStripe({ id: 'sub_123', status: 'active', trial_end: null });

    const event = {
      type: 'checkout.session.completed',
      data: { object: { metadata: {}, subscription: 'sub_123', customer: 'cus_xyz' } },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(stripe));

    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(setCalls).toHaveLength(0);
  });
});

describe('handleStripeEvent — customer.subscription.updated', () => {
  it('actualiza estado por uid del metadata', async () => {
    const { db, setCalls } = makeMockDb();
    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          metadata: { firebaseUid: 'user_abc' },
          status: 'active',
          trial_end: null,
          customer: 'cus_xyz',
        },
      },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));

    expect(setCalls).toHaveLength(1);
    expect(setCalls[0].path).toBe('users/user_abc');
    expect(setCalls[0].data).toEqual({ subscriptionStatus: 'active', trialEnd: null });
  });

  it('si no hay uid, localiza por stripeCustomerId y actualiza ese doc', async () => {
    const { db, setCalls } = makeMockDb([{ path: 'users/found_uid' }]);
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { metadata: {}, status: 'past_due', trial_end: null, customer: 'cus_xyz' } },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));

    expect(setCalls).toHaveLength(1);
    expect(setCalls[0].path).toBe('users/found_uid');
    expect(setCalls[0].data).toMatchObject({ subscriptionStatus: 'past_due' });
  });

  it('si no hay uid y no encuentra al cliente, no escribe', async () => {
    const { db, setCalls } = makeMockDb([]);
    const event = {
      type: 'customer.subscription.updated',
      data: { object: { metadata: {}, status: 'active', trial_end: null, customer: 'cus_none' } },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));

    expect(setCalls).toHaveLength(0);
  });
});

describe('handleStripeEvent — customer.subscription.deleted', () => {
  it('baja premium y pone plan free al cliente encontrado', async () => {
    const { db, setCalls } = makeMockDb([{ path: 'users/found_uid' }]);
    const event = {
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_xyz' } },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));

    expect(setCalls).toHaveLength(1);
    expect(setCalls[0].path).toBe('users/found_uid');
    expect(setCalls[0].data).toEqual({
      premium: false,
      subscriptionStatus: 'canceled',
      plan: 'free',
    });
  });

  it('no falla si no encuentra al cliente', async () => {
    const { db, setCalls } = makeMockDb([]);
    const event = {
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_none' } },
    };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));
    expect(setCalls).toHaveLength(0);
  });
});

describe('handleStripeEvent — eventos no manejados', () => {
  it('ignora tipos desconocidos sin escribir', async () => {
    const { db, setCalls } = makeMockDb();
    const event = { type: 'invoice.paid', data: { object: {} } };

    await handleStripeEvent(asEvent(event), asDb(db), asStripe(makeStripe({})));
    expect(setCalls).toHaveLength(0);
  });
});
