import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingClassSessions } from '@/features/classes/api/classesApi';

export function useClassSessions() {
  return useQuery({
    queryKey: ['class-sessions', 'upcoming'],
    queryFn: fetchUpcomingClassSessions,
  });
}
