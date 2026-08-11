import { useMemo, useState } from 'react';
import { useMyBookings } from '@/features/bookings/hooks/useMyBookings';
import { useMyWaitlistEntries } from '@/features/bookings/hooks/useMyWaitlistEntries';
import { useMyBookingHistory } from '@/features/bookings/hooks/useMyBookingHistory';
import { BookingListItem } from '@/features/bookings/components/BookingListItem';
import { WaitlistListItem } from '@/features/bookings/components/WaitlistListItem';
import { BookingHistoryItem } from '@/features/bookings/components/BookingHistoryItem';
import { BookingListItemSkeleton } from '@/features/bookings/components/BookingListItemSkeleton';
import { SegmentedToggle } from '@/components/SegmentedToggle';
import { isSessionPast } from '@/utils/classSessions';
import type {
  BookingWithSession,
  WaitlistEntryWithSession,
} from '@/features/bookings/types';

type Tab = 'proximas' | 'historial';

type UpcomingItem =
  | { kind: 'booking'; key: string; booking: BookingWithSession }
  | { kind: 'waitlist'; key: string; entry: WaitlistEntryWithSession };

function sessionSortKey(fecha: string, horaInicio: string): string {
  return `${fecha}T${horaInicio}`;
}

function itemSessionKey(item: UpcomingItem): string {
  const session = item.kind === 'booking' ? item.booking.session : item.entry.session;
  return sessionSortKey(session.fecha, session.hora_inicio);
}

function buildUpcomingItems(
  bookings: BookingWithSession[],
  waitlistEntries: WaitlistEntryWithSession[],
): UpcomingItem[] {
  const items: UpcomingItem[] = [
    ...bookings
      .filter((b) => !isSessionPast(b.session.fecha, b.session.hora_inicio))
      .map((booking) => ({ kind: 'booking' as const, key: `b-${booking.id}`, booking })),
    ...waitlistEntries
      .filter((w) => !isSessionPast(w.session.fecha, w.session.hora_inicio))
      .map((entry) => ({ kind: 'waitlist' as const, key: `w-${entry.id}`, entry })),
  ];
  return items.sort((a, b) => itemSessionKey(a).localeCompare(itemSessionKey(b)));
}

// Historial = lo que ya no es "próximo": canceladas (a cualquier fecha) o
// confirmadas cuya sesión ya ha pasado. No hay estado "completada" en BD
// (ver AI/DECISIONS.md) — se deriva por fecha, igual que en ReservasPage.
function buildHistoryItems(bookings: BookingWithSession[]): BookingWithSession[] {
  return bookings
    .filter(
      (b) =>
        b.estado === 'cancelada' || isSessionPast(b.session.fecha, b.session.hora_inicio),
    )
    .sort((a, b) =>
      sessionSortKey(b.session.fecha, b.session.hora_inicio).localeCompare(
        sessionSortKey(a.session.fecha, a.session.hora_inicio),
      ),
    );
}

export function MyBookingsPage() {
  const [tab, setTab] = useState<Tab>('proximas');
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
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useMyBookingHistory();

  const upcomingItems = useMemo(
    () => buildUpcomingItems(bookings ?? [], waitlistEntries ?? []),
    [bookings, waitlistEntries],
  );
  const historyItems = useMemo(() => buildHistoryItems(history ?? []), [history]);

  const isProximas = tab === 'proximas';
  const isLoading = isProximas ? bookingsLoading || waitlistLoading : historyLoading;
  const error = isProximas ? (bookingsError ?? waitlistError) : historyError;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">
          Mis reservas
        </h1>

        <SegmentedToggle
          value={tab}
          onChange={setTab}
          options={[
            { value: 'proximas', label: 'Próximas' },
            { value: 'historial', label: 'Historial' },
          ]}
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <span className="sr-only">Cargando…</span>
          <BookingListItemSkeleton />
          <BookingListItemSkeleton />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se han podido cargar tus clases. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {isProximas && !isLoading && !error && upcomingItems.length === 0 && (
        <p className="text-sm text-ink-faint">No tienes ninguna clase próxima.</p>
      )}
      {isProximas && upcomingItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {upcomingItems.map((item) =>
            item.kind === 'booking' ? (
              <BookingListItem key={item.key} booking={item.booking} />
            ) : (
              <WaitlistListItem key={item.key} entry={item.entry} />
            ),
          )}
        </div>
      )}

      {!isProximas && !isLoading && !error && historyItems.length === 0 && (
        <p className="text-sm text-ink-faint">Todavía no has hecho ninguna clase.</p>
      )}
      {!isProximas && historyItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {historyItems.map((booking) => (
            <BookingHistoryItem key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
