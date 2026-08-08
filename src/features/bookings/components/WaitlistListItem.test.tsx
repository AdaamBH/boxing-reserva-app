import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { WaitlistListItem } from './WaitlistListItem';
import { leaveWaitlist } from '@/features/bookings/api/bookingsApi';
import type { WaitlistEntryWithSession } from '@/features/bookings/types';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  leaveWaitlist: vi.fn(),
}));

function buildEntry(): WaitlistEntryWithSession {
  return {
    id: 'wl-1',
    session_id: 'session-1',
    user_id: 'user-1',
    dependent_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
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
  };
}

describe('WaitlistListItem', () => {
  beforeEach(() => {
    vi.mocked(leaveWaitlist).mockReset();
  });

  it('sale de la lista de espera al pulsar el botón', async () => {
    vi.mocked(leaveWaitlist).mockResolvedValue({ success: true, data: undefined });
    const user = userEvent.setup();

    render(<WaitlistListItem entry={buildEntry()} />);
    await user.click(screen.getByRole('button', { name: 'Salir de la lista de espera' }));

    expect(leaveWaitlist).toHaveBeenCalledWith({ waitlistEntryId: 'wl-1' });
  });

  it('muestra el mensaje de error cuando falla', async () => {
    vi.mocked(leaveWaitlist).mockResolvedValue({
      success: false,
      error: {
        code: 'BOOKING_NOT_FOUND',
        message: 'Esa reserva no existe o no te pertenece.',
      },
    });
    const user = userEvent.setup();

    render(<WaitlistListItem entry={buildEntry()} />);
    await user.click(screen.getByRole('button', { name: 'Salir de la lista de espera' }));

    await screen.findByText('Esa reserva no existe o no te pertenece.');
  });
});
