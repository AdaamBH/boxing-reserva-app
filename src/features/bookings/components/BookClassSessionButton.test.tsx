import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { BookClassSessionButton } from './BookClassSessionButton';
import { bookClassSession } from '@/features/bookings/api/bookingsApi';
import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  bookClassSession: vi.fn(),
}));
vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));

// BookClassSessionButton renderiza un <Link> (enlace a "Añadir
// dependiente"), que necesita un Router alrededor para no lanzar —
// MemoryRouter en cada render, igual que en ClassSessionCard.test.tsx.
function renderButton(props: ComponentProps<typeof BookClassSessionButton>) {
  return render(
    <MemoryRouter>
      <BookClassSessionButton {...props} />
    </MemoryRouter>,
  );
}

describe('BookClassSessionButton', () => {
  beforeEach(() => {
    vi.mocked(bookClassSession).mockReset();
    vi.mocked(fetchMyDependents).mockReset();
    vi.mocked(fetchMyDependents).mockResolvedValue([]);
  });

  it('reserva para uno mismo cuando no hay dependientes (no muestra selector)', async () => {
    vi.mocked(bookClassSession).mockResolvedValue({ success: true, data: 'confirmada' });
    const user = userEvent.setup();

    renderButton({ sessionId: 'session-1' });
    expect(screen.queryByLabelText('¿Para quién es la reserva?')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reservar' }));

    await screen.findByText('Reserva confirmada.');
    expect(bookClassSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
      dependentId: null,
    });
  });

  it('muestra el selector y reserva para el dependiente elegido', async () => {
    vi.mocked(fetchMyDependents).mockResolvedValue([
      {
        id: 'dep-1',
        nombre: 'Lucía',
        apellidos: 'Pérez',
        parent_user_id: 'user-1',
        fecha_nacimiento: '2015-01-01',
        relacion: 'madre',
        created_at: '2026-01-01T00:00:00.000Z',
        consent_given_at: '2026-01-01T00:00:00.000Z',
      },
    ]);
    vi.mocked(bookClassSession).mockResolvedValue({ success: true, data: 'en_espera' });
    const user = userEvent.setup();

    renderButton({ sessionId: 'session-1' });
    await user.selectOptions(
      await screen.findByLabelText('¿Para quién es la reserva?'),
      'dep-1',
    );
    await user.click(screen.getByRole('button', { name: 'Reservar' }));

    await screen.findByText('Clase llena: te hemos apuntado en la lista de espera.');
    expect(bookClassSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
      dependentId: 'dep-1',
    });
  });

  it('muestra el mensaje de error cuando la reserva falla por una regla de negocio', async () => {
    vi.mocked(bookClassSession).mockResolvedValue({
      success: false,
      error: {
        code: 'ALREADY_BOOKED',
        message: 'Ya tienes una reserva o estás en la lista de espera para esta clase.',
      },
    });
    const user = userEvent.setup();

    renderButton({ sessionId: 'session-1' });
    await user.click(screen.getByRole('button', { name: 'Reservar' }));

    await screen.findByText(
      'Ya tienes una reserva o estás en la lista de espera para esta clase.',
    );
  });
});
