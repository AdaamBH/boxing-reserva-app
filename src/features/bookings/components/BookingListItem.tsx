import { useState } from 'react';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';
import { canCancelBooking } from '@/utils/classSessions';
import { useCancelBooking } from '@/features/bookings/hooks/useCancelBooking';
import { Button } from '@/components/Button';
import type { BookingWithSession } from '@/features/bookings/types';

interface BookingListItemProps {
  booking: BookingWithSession;
}

export function BookingListItem({ booking }: BookingListItemProps) {
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useCancelBooking();
  const { session } = booking;
  const cancellable = canCancelBooking(session.fecha, session.hora_inicio);

  async function handleCancel() {
    setError(null);
    try {
      const result = await mutateAsync({ bookingId: booking.id });
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
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-medium text-slate-900">{session.nombre}</p>
      <p className="text-sm text-slate-600">
        {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
        {formatTime(session.hora_fin)}
      </p>
      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        disabled={!cancellable}
        onClick={handleCancel}
      >
        {cancellable ? 'Cancelar' : 'Ya no se puede cancelar (falta menos de 1h)'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
