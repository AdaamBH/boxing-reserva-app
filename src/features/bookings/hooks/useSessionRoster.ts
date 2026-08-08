import { useQuery } from '@tanstack/react-query';
import { fetchSessionRoster } from '@/features/bookings/api/bookingsApi';

// `enabled` para no consultar la lista de cada clase al cargar /clases —
// solo cuando el usuario despliega la lista de una sesión concreta.
export function useSessionRoster(sessionId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['bookings', 'roster', sessionId],
    queryFn: () => fetchSessionRoster(sessionId),
    enabled,
  });
}
