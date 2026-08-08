import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookClassSession } from '@/features/bookings/api/bookingsApi';
import type { BookClassSessionParams } from '@/features/bookings/types';

export function useBookClassSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: BookClassSessionParams) => bookClassSession(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
    },
  });
}
