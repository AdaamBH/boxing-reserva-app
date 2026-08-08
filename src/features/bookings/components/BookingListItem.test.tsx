import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { BookingListItem } from './BookingListItem';
import { cancelBooking } from '@/features/bookings/api/bookingsApi';
import type { BookingWithSession } from '@/features/bookings/types';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  cancelBooking: vi.fn(),
}));

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildBooking(
  sessionOverrides: Partial<BookingWithSession['session']> = {},
): BookingWithSession {
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
      ...sessionOverrides,
    },
  };
}

describe('BookingListItem', () => {
  beforeEach(() => {
    vi.mocked(cancelBooking).mockReset();
  });

  it('cancela la reserva al pulsar "Cancelar"', async () => {
    vi.mocked(cancelBooking).mockResolvedValue({
      success: true,
      data: { promoted: false },
    });
    const user = userEvent.setup();

    render(<BookingListItem booking={buildBooking()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(cancelBooking).toHaveBeenCalledWith({ bookingId: 'booking-1' });
  });

  it('deshabilita el botón cuando falta menos de 1 hora para la clase', () => {
    const soon = new Date();
    soon.setMinutes(soon.getMinutes() + 30);
    const fecha = toLocalDateString(soon);
    const horaInicio = `${String(soon.getHours()).padStart(2, '0')}:${String(soon.getMinutes()).padStart(2, '0')}`;

    render(
      <BookingListItem booking={buildBooking({ fecha, hora_inicio: horaInicio })} />,
    );

    expect(
      screen.getByRole('button', { name: 'Ya no se puede cancelar (falta menos de 1h)' }),
    ).toBeDisabled();
  });

  it('muestra el mensaje de error cuando la cancelación falla por regla de negocio', async () => {
    vi.mocked(cancelBooking).mockResolvedValue({
      success: false,
      error: { code: 'ALREADY_CANCELLED', message: 'Esa reserva ya estaba cancelada.' },
    });
    const user = userEvent.setup();

    render(<BookingListItem booking={buildBooking()} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    await screen.findByText('Esa reserva ya estaba cancelada.');
  });
});
