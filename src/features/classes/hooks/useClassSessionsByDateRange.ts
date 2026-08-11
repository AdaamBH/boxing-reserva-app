import { useQuery } from '@tanstack/react-query';
import { fetchClassSessionsByDateRange } from '@/features/classes/api/classesApi';

export function useClassSessionsByDateRange(
  startDate: string,
  endDate: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['class-sessions', 'range', startDate, endDate],
    queryFn: () => fetchClassSessionsByDateRange(startDate, endDate),
    enabled,
  });
}
