import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { WaitlistedActions } from './WaitlistedActions';
import { leaveWaitlist } from '@/features/bookings/api/bookingsApi';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  leaveWaitlist: vi.fn(),
}));

describe('WaitlistedActions', () => {
  beforeEach(() => {
    vi.mocked(leaveWaitlist).mockReset();
  });

  it('sale de la lista de espera al pulsar el botón', async () => {
    vi.mocked(leaveWaitlist).mockResolvedValue({ success: true, data: undefined });
    const user = userEvent.setup();

    render(<WaitlistedActions waitlistEntryId="wl-1" />);
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

    render(<WaitlistedActions waitlistEntryId="wl-1" />);
    await user.click(screen.getByRole('button', { name: 'Salir de la lista de espera' }));

    await screen.findByText('Esa reserva no existe o no te pertenece.');
  });
});
