import { useQuery } from '@tanstack/react-query';
import { fetchSessionOccupancy } from '@/features/bookings/api/bookingsApi';

export function useSessionOccupancy(sessionIds: string[]) {
  const sortedIds = [...sessionIds].sort();

  return useQuery({
    // Ids ordenados en la queryKey: el mismo conjunto de sesiones en
    // distinto orden no debe producir una entrada de caché distinta.
    queryKey: ['bookings', 'occupancy', ...sortedIds],
    queryFn: () => fetchSessionOccupancy(sortedIds),
    enabled: sortedIds.length > 0,
  });
}
