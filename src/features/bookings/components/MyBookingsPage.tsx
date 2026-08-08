import { useMyBookings } from '@/features/bookings/hooks/useMyBookings';
import { useMyWaitlistEntries } from '@/features/bookings/hooks/useMyWaitlistEntries';
import { BookingListItem } from '@/features/bookings/components/BookingListItem';
import { WaitlistListItem } from '@/features/bookings/components/WaitlistListItem';

export function MyBookingsPage() {
  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useMyBookings();
  const {
    data: waitlistEntries,
    isLoading: waitlistLoading,
    error: waitlistError,
  } = useMyWaitlistEntries();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">
        Mis reservas
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-wide text-ink-muted uppercase">
          Dentro de la clase
        </h2>

        {bookingsLoading && <p className="text-sm text-ink-faint">Cargando…</p>}
        {bookingsError && (
          <p role="alert" className="text-sm text-danger-500">
            No se han podido cargar tus reservas. Inténtalo de nuevo en unos segundos.
          </p>
        )}
        {bookings?.length === 0 && (
          <p className="text-sm text-ink-faint">No tienes ninguna reserva confirmada.</p>
        )}
        {bookings && bookings.length > 0 && (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <BookingListItem key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-wide text-ink-muted uppercase">
          Lista de espera
        </h2>

        {waitlistLoading && <p className="text-sm text-ink-faint">Cargando…</p>}
        {waitlistError && (
          <p role="alert" className="text-sm text-danger-500">
            No se ha podido cargar tu lista de espera. Inténtalo de nuevo en unos
            segundos.
          </p>
        )}
        {waitlistEntries?.length === 0 && (
          <p className="text-sm text-ink-faint">No estás en ninguna lista de espera.</p>
        )}
        {waitlistEntries && waitlistEntries.length > 0 && (
          <div className="flex flex-col gap-3">
            {waitlistEntries.map((entry) => (
              <WaitlistListItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
