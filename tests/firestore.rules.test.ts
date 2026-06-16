import { readFileSync } from 'fs';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-smartstudy',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Semillas con reglas desactivadas (datos de partida para cada test).
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/alice'), { name: 'Alice', admin: false, premium: false, plan: 'free' });
    await setDoc(doc(db, 'users/bob'), { name: 'Bob', admin: false, premium: false, plan: 'free' });
    await setDoc(doc(db, 'users/carol'), { name: 'Carol', admin: false, premium: true, plan: 'basic' });

    await setDoc(doc(db, 'rate_limits/alice'), { minuteCount: 0 });
    await setDoc(doc(db, 'subjects/biologia'), { name: 'Biología' });
    await setDoc(doc(db, 'subjects/biologia/content/c1'), { title: 'Tema', type: 'pdf' });

    const temas = 'contenido/1ESO/asignaturas/Matematicas/temas';
    await setDoc(doc(db, `${temas}/1`), { publicado: true, numero_tema: 1 });
    await setDoc(doc(db, `${temas}/2`), { publicado: true, numero_tema: 2 });
    await setDoc(doc(db, `${temas}/3`), { publicado: true, numero_tema: 3, gratis: true });
    await setDoc(doc(db, `${temas}/9`), { publicado: false, numero_tema: 9 });
  });
});

const alice = () => testEnv.authenticatedContext('alice').firestore();
const carol = () => testEnv.authenticatedContext('carol').firestore();
const admin = () => testEnv.authenticatedContext('zoe', { admin: true }).firestore();
const anon = () => testEnv.unauthenticatedContext().firestore();

describe('users/{uid}', () => {
  it('el dueño lee su propio documento', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'users/alice')));
  });

  it('no se puede leer el documento de otro usuario', async () => {
    await assertFails(getDoc(doc(alice(), 'users/bob')));
  });

  it('un anónimo no puede leer documentos de usuario', async () => {
    await assertFails(getDoc(doc(anon(), 'users/alice')));
  });

  it('el dueño puede actualizar campos de perfil seguros', async () => {
    await assertSucceeds(updateDoc(doc(alice(), 'users/alice'), { name: 'Alicia' }));
  });

  it('el dueño NO puede auto-asignarse premium', async () => {
    await assertFails(updateDoc(doc(alice(), 'users/alice'), { premium: true }));
  });

  it('el dueño NO puede auto-asignarse admin', async () => {
    await assertFails(updateDoc(doc(alice(), 'users/alice'), { admin: true }));
  });

  it('el dueño NO puede resetear su cuota mensual de IA', async () => {
    await assertFails(updateDoc(doc(alice(), 'users/alice'), { aiUsageThisMonth: 0 }));
  });

  it('crear el propio doc con valores por defecto seguros funciona', async () => {
    const dave = testEnv.authenticatedContext('dave').firestore();
    await assertSucceeds(
      setDoc(doc(dave, 'users/dave'), { name: 'Dave', admin: false, premium: false, plan: 'free' })
    );
  });

  it('crear el propio doc con premium=true se rechaza', async () => {
    const evil = testEnv.authenticatedContext('evil').firestore();
    await assertFails(
      setDoc(doc(evil, 'users/evil'), { name: 'Evil', admin: false, premium: true, plan: 'basic' })
    );
  });
});

describe('subcolecciones del usuario', () => {
  it('el dueño escribe y lee su educational_chat', async () => {
    await assertSucceeds(
      setDoc(doc(alice(), 'users/alice/educational_chat/m1'), { role: 'user', content: 'hola' })
    );
    await assertSucceeds(getDoc(doc(alice(), 'users/alice/educational_chat/m1')));
  });

  it('no se puede leer el educational_chat de otro', async () => {
    await assertFails(getDoc(doc(alice(), 'users/bob/educational_chat/m1')));
  });

  it('el dueño escribe su ai_history; otro no', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'users/alice/ai_history/h1'), { tipo: 'resumen' }));
    await assertFails(setDoc(doc(alice(), 'users/bob/ai_history/h1'), { tipo: 'resumen' }));
  });
});

describe('rate_limits y user_usage', () => {
  it('el dueño lee su rate_limits pero NO lo escribe', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'rate_limits/alice')));
    await assertFails(setDoc(doc(alice(), 'rate_limits/alice'), { minuteCount: 999 }));
  });

  it('el dueño lee y escribe su user_usage', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'user_usage/alice'), { count: 1 }));
    await assertSucceeds(getDoc(doc(alice(), 'user_usage/alice')));
  });

  it('no se puede escribir el user_usage de otro', async () => {
    await assertFails(setDoc(doc(alice(), 'user_usage/bob'), { count: 1 }));
  });
});

describe('subjects (asignaturas)', () => {
  it('un usuario logueado lee subjects y su content', async () => {
    await assertSucceeds(getDoc(doc(alice(), 'subjects/biologia')));
    await assertSucceeds(getDoc(doc(alice(), 'subjects/biologia/content/c1')));
  });

  it('un anónimo no puede leer subjects', async () => {
    await assertFails(getDoc(doc(anon(), 'subjects/biologia')));
  });

  it('un usuario normal no puede escribir subjects; un admin sí', async () => {
    await assertFails(setDoc(doc(alice(), 'subjects/biologia/content/c2'), { title: 'X', type: 'pdf' }));
    await assertSucceeds(setDoc(doc(admin(), 'subjects/biologia/content/c2'), { title: 'X', type: 'pdf' }));
  });
});

describe('contenido/temas (paywall)', () => {
  const temas = 'contenido/1ESO/asignaturas/Matematicas/temas';

  it('un usuario free lee el tema 1 publicado', async () => {
    await assertSucceeds(getDoc(doc(alice(), `${temas}/1`)));
  });

  it('un usuario free NO lee el tema 2 publicado (de pago)', async () => {
    await assertFails(getDoc(doc(alice(), `${temas}/2`)));
  });

  it('un usuario free lee un tema marcado gratis', async () => {
    await assertSucceeds(getDoc(doc(alice(), `${temas}/3`)));
  });

  it('un usuario premium lee el tema 2 publicado', async () => {
    await assertSucceeds(getDoc(doc(carol(), `${temas}/2`)));
  });

  it('un usuario free NO lee un tema sin publicar', async () => {
    await assertFails(getDoc(doc(alice(), `${temas}/9`)));
  });

  it('un admin lee un tema sin publicar', async () => {
    await assertSucceeds(getDoc(doc(admin(), `${temas}/9`)));
  });

  it('un usuario normal no puede escribir temas', async () => {
    await assertFails(setDoc(doc(alice(), `${temas}/1`), { publicado: true, numero_tema: 1 }));
  });
});
