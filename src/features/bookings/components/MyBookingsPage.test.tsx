import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { MyBookingsPage } from './MyBookingsPage';
import {
  fetchMyBookings,
  fetchMyBookingHistory,
  fetchMyWaitlistEntries,
} from '@/features/bookings/api/bookingsApi';
import type { BookingWithSession } from '@/features/bookings/types';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  fetchMyBookings: vi.fn(),
  fetchMyBookingHistory: vi.fn(),
  fetchMyWaitlistEntries: vi.fn(),
  cancelBooking: vi.fn(),
  leaveWaitlist: vi.fn(),
}));

function buildBooking(overrides: Partial<BookingWithSession>): BookingWithSession {
  return {
    id: 'booking-1',
    session_id: 'session-1',
    user_id: 'user-1',
    dependent_id: null,
    estado: 'confirmada',
    created_at: '2026-01-01T00:00:00.000Z',
    cancelled_at: null,
    session: {
      id: 'session-1',
      nombre: 'Boxeo',
      nivel: 'intermedio',
      fecha: '2099-07-23',
      hora_inicio: '18:00',
      hora_fin: '19:00',
      aforo_maximo: 20,
      trainer: null,
      estado: 'programada',
      created_at: '2026-07-23T00:00:00.000Z',
      template_id: null,
      trainer_id: 'trainer-1',
    },
    ...overrides,
  };
}

describe('MyBookingsPage', () => {
  beforeEach(() => {
    vi.mocked(fetchMyBookings).mockReset();
    vi.mocked(fetchMyBookingHistory).mockReset();
    vi.mocked(fetchMyWaitlistEntries).mockReset();
  });

  it('muestra un aviso cuando no hay clases próximas', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([]);
    vi.mocked(fetchMyBookingHistory).mockResolvedValue([]);

    render(<MyBookingsPage />);

    await screen.findByText('No tienes ninguna clase próxima.');
  });

  it('renderiza las reservas confirmadas y la lista de espera en Próximas', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([
      buildBooking({
        id: 'booking-1',
        session: { ...buildBooking({}).session, nombre: 'Boxeo confirmado' },
      }),
    ]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([
      {
        id: 'waitlist-1',
        session_id: 'session-2',
        user_id: 'user-1',
        dependent_id: null,
        created_at: '2026-01-01T00:00:00.000Z',
        session: {
          ...buildBooking({}).session,
          id: 'session-2',
          nombre: 'Boxeo en espera',
        },
      },
    ]);
    vi.mocked(fetchMyBookingHistory).mockResolvedValue([]);

    render(<MyBookingsPage />);

    await screen.findByText('Boxeo confirmado');
    expect(screen.getByText('Boxeo en espera')).toBeInTheDocument();
    expect(screen.getByText('En lista de espera')).toBeInTheDocument();
  });

  it('cambia a la pestaña Historial y muestra clases pasadas y canceladas', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([]);
    vi.mocked(fetchMyBookingHistory).mockResolvedValue([
      buildBooking({
        id: 'past-1',
        estado: 'confirmada',
        session: {
          ...buildBooking({}).session,
          nombre: 'Boxeo pasado',
          fecha: '2020-01-01',
        },
      }),
      buildBooking({
        id: 'cancelled-1',
        estado: 'cancelada',
        session: {
          ...buildBooking({}).session,
          nombre: 'Boxeo cancelado',
          fecha: '2099-07-23',
        },
      }),
    ]);
    const user = userEvent.setup();

    render(<MyBookingsPage />);
    await screen.findByText('No tienes ninguna clase próxima.');

    await user.click(screen.getByRole('button', { name: 'Historial' }));

    await screen.findByText('Boxeo pasado');
    expect(screen.getByText('Boxeo cancelado')).toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('muestra un aviso cuando el historial está vacío', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([]);
    vi.mocked(fetchMyBookingHistory).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<MyBookingsPage />);
    await screen.findByText('No tienes ninguna clase próxima.');

    await user.click(screen.getByRole('button', { name: 'Historial' }));

    await screen.findByText('Todavía no has hecho ninguna clase.');
  });
});
