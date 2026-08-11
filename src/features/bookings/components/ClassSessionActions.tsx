import { BookClassSessionButton } from '@/features/bookings/components/BookClassSessionButton';
import { ConfirmedBookingActions } from '@/features/bookings/components/ConfirmedBookingActions';
import { WaitlistedActions } from '@/features/bookings/components/WaitlistedActions';
import type { SessionBookingStatus } from '@/features/bookings/types';

interface ClassSessionActionsProps {
  sessionId: string;
  fecha: string;
  horaInicio: string;
  status: SessionBookingStatus | undefined;
  past: boolean;
}

/**
 * Decide qué acción mostrar en una tarjeta de sesión: reservar, gestionar
 * una reserva ya confirmada (con acceso a la lista de apuntados), o
 * gestionar una entrada en lista de espera. Nunca más de una a la vez —
 * ver useMySessionBookingStatuses.
 */
export function ClassSessionActions({
  sessionId,
  fecha,
  horaInicio,
  status,
  past,
}: ClassSessionActionsProps) {
  if (status?.type === 'confirmed') {
    return (
      <ConfirmedBookingActions
        sessionId={sessionId}
        bookingId={status.bookingId}
        fecha={fecha}
        horaInicio={horaInicio}
      />
    );
  }

  if (status?.type === 'waitlisted') {
    return <WaitlistedActions waitlistEntryId={status.waitlistEntryId} />;
  }

  if (past) {
    return null;
  }

  return <BookClassSessionButton sessionId={sessionId} />;
}
