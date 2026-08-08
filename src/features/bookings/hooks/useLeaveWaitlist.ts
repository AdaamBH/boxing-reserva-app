import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveWaitlist } from '@/features/bookings/api/bookingsApi';
import type { LeaveWaitlistParams } from '@/features/bookings/types';

export function useLeaveWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: LeaveWaitlistParams) => leaveWaitlist(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
    },
  });
}
