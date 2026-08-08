import { useQuery } from '@tanstack/react-query';
import { fetchMyWaitlistEntries } from '@/features/bookings/api/bookingsApi';

export function useMyWaitlistEntries() {
  return useQuery({
    queryKey: ['waitlist-entries', 'mine'],
    queryFn: fetchMyWaitlistEntries,
  });
}
