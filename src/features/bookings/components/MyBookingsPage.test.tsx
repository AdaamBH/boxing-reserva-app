import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MyBookingsPage } from './MyBookingsPage';
import {
  fetchMyBookings,
  fetchMyWaitlistEntries,
} from '@/features/bookings/api/bookingsApi';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  fetchMyBookings: vi.fn(),
  fetchMyWaitlistEntries: vi.fn(),
  cancelBooking: vi.fn(),
  leaveWaitlist: vi.fn(),
}));

describe('MyBookingsPage', () => {
  beforeEach(() => {
    vi.mocked(fetchMyBookings).mockReset();
    vi.mocked(fetchMyWaitlistEntries).mockReset();
  });

  it('muestra los estados vacíos cuando no hay reservas ni lista de espera', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([]);

    render(<MyBookingsPage />);

    await screen.findByText('No tienes ninguna reserva confirmada.');
    expect(screen.getByText('No estás en ninguna lista de espera.')).toBeInTheDocument();
  });

  it('renderiza las reservas confirmadas recibidas', async () => {
    vi.mocked(fetchMyBookings).mockResolvedValue([
      {
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
      },
    ]);
    vi.mocked(fetchMyWaitlistEntries).mockResolvedValue([]);

    render(<MyBookingsPage />);

    await screen.findByText('Boxeo');
  });
});
