import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';

interface AppProvidersProps {
  children: ReactNode;
}

// Punto único donde se acumulan los providers globales de la aplicación.
// Cuando llegue la Fase 1 (auth), el AuthProvider se añade aquí también,
// envolviendo a `children` — así App.tsx no tiene que cambiar cada vez
// que se añade un provider nuevo.
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}
