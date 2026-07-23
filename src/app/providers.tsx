import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import { SessionProvider } from '@/features/auth/hooks/SessionProvider';

interface AppProvidersProps {
  children: ReactNode;
}

// El orden entre QueryClientProvider y SessionProvider no importa en la
// práctica (no dependen el uno del otro), pero SessionProvider envuelve a
// BrowserRouter para que cualquier lógica de rutas futura (rutas
// protegidas, redirecciones según sesión) pueda usar useSession/useAuth
// sin cambiar nada aquí.
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}
