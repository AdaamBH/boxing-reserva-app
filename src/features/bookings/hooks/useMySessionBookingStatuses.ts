import { useMyBookings } from '@/features/bookings/hooks/useMyBookings';
import { useMyWaitlistEntries } from '@/features/bookings/hooks/useMyWaitlistEntries';
import type { SessionBookingStatus } from '@/features/bookings/types';

/**
 * Un mismo usuario puede tener una reserva confirmada y, a la vez, a un
 * dependiente en lista de espera para la MISMA sesión (la restricción de
 * "ya apuntado" es por sesión + beneficiario, no por sesión + usuario —
 * ver book_class_session en la migración). Para decidir qué acción mostrar
 * en la tarjeta de una sesión, "confirmada" siempre gana sobre "en espera":
 * si el usuario ya tiene sitio seguro, eso es lo relevante para él.
 */
function buildStatusMap(
  bookings: { session_id: string; id: string }[],
  waitlistEntries: { session_id: string; id: string }[],
): Map<string, SessionBookingStatus> {
  const statuses = new Map<string, SessionBookingStatus>();

  for (const entry of waitlistEntries) {
    statuses.set(entry.session_id, { type: 'waitlisted', waitlistEntryId: entry.id });
  }
  for (const booking of bookings) {
    statuses.set(booking.session_id, { type: 'confirmed', bookingId: booking.id });
  }

  return statuses;
}

/** Estado de reserva del usuario actual para cada sesión, indexado por session_id. */
export function useMySessionBookingStatuses() {
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const { data: waitlistEntries, isLoading: waitlistLoading } = useMyWaitlistEntries();

  return {
    data: buildStatusMap(bookings ?? [], waitlistEntries ?? []),
    isLoading: bookingsLoading || waitlistLoading,
  };
}
