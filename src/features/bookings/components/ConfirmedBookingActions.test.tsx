import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ConfirmedBookingActions } from './ConfirmedBookingActions';
import { cancelBooking } from '@/features/bookings/api/bookingsApi';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  cancelBooking: vi.fn(),
}));

function renderActions(fecha = '2099-07-23', horaInicio = '18:00') {
  return render(
    <MemoryRouter>
      <ConfirmedBookingActions
        sessionId="session-1"
        bookingId="booking-1"
        fecha={fecha}
        horaInicio={horaInicio}
      />
    </MemoryRouter>,
  );
}

describe('ConfirmedBookingActions', () => {
  beforeEach(() => {
    vi.mocked(cancelBooking).mockReset();
  });

  it('enlaza a la lista de apuntados de la sesión', () => {
    renderActions();

    expect(screen.getByRole('link', { name: 'Ver Clase' })).toHaveAttribute(
      'href',
      '/clases/session-1/lista',
    );
  });

  it('cancela la reserva al pulsar "Cancelar reserva"', async () => {
    vi.mocked(cancelBooking).mockResolvedValue({
      success: true,
      data: { promoted: false },
    });
    const user = userEvent.setup();

    renderActions();
    await user.click(screen.getByRole('button', { name: 'Cancelar reserva' }));

    expect(cancelBooking).toHaveBeenCalledWith({ bookingId: 'booking-1' });
  });

  it('deshabilita la cancelación cuando falta menos de 1 hora para la clase', () => {
    const soon = new Date();
    soon.setMinutes(soon.getMinutes() + 30);
    const year = soon.getFullYear();
    const month = String(soon.getMonth() + 1).padStart(2, '0');
    const day = String(soon.getDate()).padStart(2, '0');
    const horaInicio = `${String(soon.getHours()).padStart(2, '0')}:${String(soon.getMinutes()).padStart(2, '0')}`;

    renderActions(`${year}-${month}-${day}`, horaInicio);

    expect(
      screen.getByRole('button', { name: 'Ya no se puede cancelar (falta menos de 1h)' }),
    ).toBeDisabled();
  });
});
