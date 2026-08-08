import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Config separada de vite.config.ts a propósito: estos tests hablan con un
// Supabase local real (Docker, `supabase start`), no con jsdom+mocks — ver
// AI/TESTING.md ("no mocks para las funciones atómicas de reserva/
// cancelación, un mock nunca demostraría su corrección de verdad").
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
