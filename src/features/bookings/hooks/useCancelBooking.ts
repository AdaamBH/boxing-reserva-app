import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '@/features/bookings/api/bookingsApi';
import type { CancelBookingParams } from '@/features/bookings/types';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelBookingParams) => cancelBooking(params),
    // Cancelar puede promocionar a alguien de la lista de espera, así que
    // invalida ambas colecciones aunque el usuario solo haya tocado una.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
    },
  });
}
