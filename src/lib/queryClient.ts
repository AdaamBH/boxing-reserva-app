import { QueryClient } from '@tanstack/react-query';

// Opciones por defecto pensadas para datos que cambian con el uso normal
// de un gimnasio (aforo, reservas) pero no cada segundo: evitamos refetch
// agresivo innecesario, pero sí revalidamos al volver a la pestaña/app,
// que es cuando más importa tener el aforo actualizado.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30s: evita refetch duplicado en navegación rápida
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
