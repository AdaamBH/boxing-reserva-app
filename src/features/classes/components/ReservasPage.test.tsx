import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ReservasPage } from './ReservasPage';
import { fetchClassSessionsByDateRange } from '@/features/classes/api/classesApi';
import {
  fetchMyBookings,
  fetchMyWaitlistEntries,
} from '@/features/bookings/api/bookingsApi';
import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

vi.mock('@/features/classes/api/classesApi', () => ({
  fetchClassSessionsByDateRange: vi.fn(),
}));
vi.mock('@/features/bookings/api/bookingsApi', () => ({
  fetchMyBookings: vi.fn(),
  fetchMyWaitlistEntries: vi.fn(),
  bookClassSession: vi.fn(),
}));
vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

function buildSession(
  overrides: Partial<ClassSessionWithTrainer>,
): ClassSessionWithTrainer {
  return {
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
    ...overrides,
  };
}

describe('ReservasPage', () => {
  beforeEach(() => {
    vi.mocked(fetchClassSessionsByDateRange).mockReset();
    vi.mocked(fetchMyBookings).mockReset().mockResolvedValue([]);
    vi.mocked(fetchMyWaitlistEntries).mockReset().mockResolvedValue([]);
    vi.mocked(fetchMyDependents).mockReset().mockResolvedValue([]);
    vi.mocked(useAuth).mockReturnValue({
      profile: { default_dependent_id: null },
    } as ReturnType<typeof useAuth>);
  });

  it('muestra solo las clases del día seleccionado y cambia al elegir otro día', async () => {
    vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([
      buildSession({ id: 'jueves', nombre: 'Boxeo jueves', fecha: '2099-07-23' }),
      buildSession({ id: 'viernes', nombre: 'Boxeo viernes', fecha: '2099-07-24' }),
    ]);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/reservas?fecha=2099-07-23']}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('Boxeo jueves');
    expect(screen.queryByText('Boxeo viernes')).not.toBeInTheDocument();

    await user.click(screen.getByText('24'));

    await screen.findByText('Boxeo viernes');
    expect(screen.queryByText('Boxeo jueves')).not.toBeInTheDocument();
  });

  it('muestra un aviso cuando el día seleccionado no tiene clases', async () => {
    vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/reservas?fecha=2099-07-23']}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('No hay clases programadas este día.');
  });

  it('cambia a la vista de mes y filtra por el día elegido en el calendario', async () => {
    vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([
      buildSession({ id: 'jueves', nombre: 'Boxeo jueves', fecha: '2099-07-23' }),
    ]);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/reservas?fecha=2099-07-23']}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('Boxeo jueves');

    await user.click(screen.getByRole('button', { name: 'Mes' }));

    await screen.findByText('Boxeo jueves');
    expect(screen.getByRole('button', { name: '23' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
