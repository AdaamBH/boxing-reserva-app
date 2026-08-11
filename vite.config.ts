import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // host: true expone el servidor en la red local (0.0.0.0), no solo en
  // localhost — necesario para abrir la app desde el móvil durante
  // desarrollo (mismo WiFi que el ordenador). allowedHosts: true porque,
  // por defecto, Vite rechaza (cortando la conexión en seco, sin una
  // respuesta HTTP válida — así es como un navegador lo ve como "respuesta
  // no válida") cualquier petición cuya cabecera Host no esté en una lista
  // permitida, para protegerse de DNS rebinding; aquí se desactiva a
  // propósito porque es un servidor de desarrollo en una red de confianza
  // (WiFi de casa), no algo expuesto a Internet. Solo afecta a `npm run
  // dev`, no a producción.
  server: {
    host: true,
    allowedHosts: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // tests/e2e/ es de Playwright, no de Vitest — se excluye explícitamente
    // para que no intente ejecutar specs de Playwright como si fueran unitarios.
    // tests/integration/ tiene su propia config (vitest.integration.config.ts,
    // `npm run test:integration`) porque habla con un Supabase local real, no
    // con mocks — no debe correr como parte de `npm run test` (AI/TESTING.md).
    exclude: ['node_modules', 'tests/e2e/**', 'tests/integration/**'],
  },
});
