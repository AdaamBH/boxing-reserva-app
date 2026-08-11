import { useState } from 'react';
import { Link } from 'react-router-dom';
import { canCancelBooking } from '@/utils/classSessions';
import { useCancelBooking } from '@/features/bookings/hooks/useCancelBooking';
import { Button } from '@/components/Button';

interface ConfirmedBookingActionsProps {
  sessionId: string;
  bookingId: string;
  fecha: string;
  horaInicio: string;
}

/** Acciones para una sesión donde el usuario ya tiene una reserva confirmada. */
export function ConfirmedBookingActions({
  sessionId,
  bookingId,
  fecha,
  horaInicio,
}: ConfirmedBookingActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCancelBooking();
  const cancellable = canCancelBooking(fecha, horaInicio);

  async function handleCancel() {
    setError(null);
    try {
      const result = await mutateAsync({ bookingId });
      if (!result.success) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-success-500">Ya estás apuntado ✓</p>

        <Link
          to={`/clases/${sessionId}/lista`}
          className="text-sm text-ink-faint underline-offset-2 hover:text-ink-muted hover:underline"
        >
          Ver Clase
        </Link>
      </div>

      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        disabled={!cancellable}
        onClick={handleCancel}
      >
        {cancellable ? 'Cancelar reserva' : 'Ya no se puede cancelar (falta menos de 1h)'}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
