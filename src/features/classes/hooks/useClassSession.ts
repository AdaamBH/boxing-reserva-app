import { useQuery } from '@tanstack/react-query';
import { fetchClassSessionById } from '@/features/classes/api/classesApi';

export function useClassSession(sessionId: string) {
  return useQuery({
    queryKey: ['class-sessions', sessionId],
    queryFn: () => fetchClassSessionById(sessionId),
  });
}
