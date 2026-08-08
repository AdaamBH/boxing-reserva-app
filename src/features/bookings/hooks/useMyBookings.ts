import { useQuery } from '@tanstack/react-query';
import { fetchMyBookings } from '@/features/bookings/api/bookingsApi';

export function useMyBookings() {
  return useQuery({ queryKey: ['bookings', 'mine'], queryFn: fetchMyBookings });
}
