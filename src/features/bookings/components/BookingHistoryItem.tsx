import { formatSpanishDate, formatTime } from '@/utils/formatDate';
import type { BookingWithSession } from '@/features/bookings/types';

interface BookingHistoryItemProps {
  booking: BookingWithSession;
}

/** Fila de solo lectura para el historial — a diferencia de BookingListItem,
 * no hay ninguna acción posible sobre una clase que ya ha pasado. */
export function BookingHistoryItem({ booking }: BookingHistoryItemProps) {
  const { session } = booking;
  const cancelled = booking.estado === 'cancelada';
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-canvas-raised p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-ink">{session.nombre}</p>
        {cancelled && (
          <span className="shrink-0 rounded-full bg-chalk px-2.5 py-1 text-xs font-medium text-ink-faint">
            Cancelada
          </span>
        )}
      </div>
      <p className="text-sm text-ink-muted">
        {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
        {formatTime(session.hora_fin)}
      </p>
      <p className="text-sm text-ink-muted">Con {trainerName}</p>
    </div>
  );
}
