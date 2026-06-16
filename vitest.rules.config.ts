import { defineConfig } from 'vitest/config';

// Config separada para los tests de reglas de Firestore. Corren contra el
// emulador (entorno node, sin jsdom ni setup de testing-library) y se lanzan
// con `npm run test:rules`, que arranca el emulador con firebase emulators:exec.
export default defineConfig({
  test: {
    include: ['tests/**/*.rules.test.ts'],
    environment: 'node',
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
