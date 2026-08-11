import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test-utils';
import { BookingHistoryItem } from './BookingHistoryItem';
import type { BookingWithSession } from '@/features/bookings/types';

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
      nombre: 'Boxeo técnico',
      nivel: 'intermedio',
      fecha: '2026-01-05',
      hora_inicio: '18:00',
      hora_fin: '19:00',
      aforo_maximo: 20,
      trainer: {
        id: 't1',
        nombre: 'Carlos Martínez',
      } as BookingWithSession['session']['trainer'],
      estado: 'programada',
      created_at: '2026-01-01T00:00:00.000Z',
      template_id: null,
      trainer_id: 'trainer-1',
    },
    ...overrides,
  };
}

describe('BookingHistoryItem', () => {
  it('muestra la clase, la fecha y el entrenador sin ninguna acción', () => {
    render(<BookingHistoryItem booking={buildBooking({})} />);

    expect(screen.getByText('Boxeo técnico')).toBeInTheDocument();
    expect(screen.getByText('Con Carlos Martínez')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancelada')).not.toBeInTheDocument();
  });

  it('marca las reservas canceladas', () => {
    render(<BookingHistoryItem booking={buildBooking({ estado: 'cancelada' })} />);

    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });
});
