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
