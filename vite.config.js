 import path from "path"
import { fileURLToPath } from "url"
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.jsx',
    css: false,
    // Evita recoger tests de copias de worktrees, dependencias y los tests de
    // reglas Firestore (esos corren con el emulador vía `npm run test:rules`).
    exclude: ['node_modules', 'dist', '.claude/**', '**/*.rules.test.ts'],
  },
})
