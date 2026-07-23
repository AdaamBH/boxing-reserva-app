/* eslint-disable react-refresh/only-export-components -- este archivo nunca pasa por Fast Refresh (solo lo importa Vitest, no el servidor de Vite); mezclar el wrapper interno con `render` y el `export *` de Testing Library es el patrón oficial de "custom render" de la propia librería. */
import type { ReactElement, ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Un QueryClient nuevo en cada render — así la caché de un test no
// contamina al siguiente. `retry: false` en ambos: por defecto las
// queries reintentan 3 veces con espera creciente, lo que solo alarga
// los tests sin aportar nada al comprobar un estado de error.
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
  );
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

// Re-exporta el resto de Testing Library tal cual — así un test solo
// cambia de dónde importa `render` (`@testing-library/react` →
// `@/test-utils`), sin tocar nada más.
export * from '@testing-library/react';