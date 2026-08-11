import { useQuery } from '@tanstack/react-query';
import { fetchMyBookingHistory } from '@/features/bookings/api/bookingsApi';

export function useMyBookingHistory() {
  return useQuery({ queryKey: ['bookings', 'history'], queryFn: fetchMyBookingHistory });
}
