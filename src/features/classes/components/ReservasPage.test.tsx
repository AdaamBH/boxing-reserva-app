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
import { getLastBookableWeekStart } from '@/utils/bookingWindow';
import { addDays, toDateString } from '@/utils/calendarDates';

// Días reales dentro de la ventana de reserva (jueves y viernes de la
// semana siguiente), en vez de un año fijo lejano: desde que existe el tope
// (ver bookingWindow.ts) una fecha como 2099 se recorta al último día
// reservable, así que ya no sirve para simular "un día cualquiera".
const NEXT_WEEK_START = getLastBookableWeekStart();
const DAY_A = addDays(NEXT_WEEK_START, 3);
const DAY_B = addDays(NEXT_WEEK_START, 4);
const DAY_A_STR = toDateString(DAY_A);
const DAY_B_STR = toDateString(DAY_B);

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
    fecha: DAY_A_STR,
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
      buildSession({ id: 'dia-a', nombre: 'Boxeo jueves', fecha: DAY_A_STR }),
      buildSession({ id: 'dia-b', nombre: 'Boxeo viernes', fecha: DAY_B_STR }),
    ]);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[`/reservas?fecha=${DAY_A_STR}`]}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('Boxeo jueves');
    expect(screen.queryByText('Boxeo viernes')).not.toBeInTheDocument();

    await user.click(screen.getByText(String(DAY_B.getDate())));

    await screen.findByText('Boxeo viernes');
    expect(screen.queryByText('Boxeo jueves')).not.toBeInTheDocument();
  });

  it('muestra un aviso cuando el día seleccionado no tiene clases', async () => {
    vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={[`/reservas?fecha=${DAY_A_STR}`]}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('No hay clases programadas este día.');
  });

  it('cambia a la vista de mes y filtra por el día elegido en el calendario', async () => {
    vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([
      buildSession({ id: 'dia-a', nombre: 'Boxeo jueves', fecha: DAY_A_STR }),
    ]);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={[`/reservas?fecha=${DAY_A_STR}`]}>
        <ReservasPage />
      </MemoryRouter>,
    );

    await screen.findByText('Boxeo jueves');

    await user.click(screen.getByRole('button', { name: 'Mes' }));

    await screen.findByText('Boxeo jueves');
    expect(screen.getByRole('button', { name: String(DAY_A.getDate()) })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  // Tope de la ventana de reserva (ver bookingWindow.ts). Sin estas dos
  // barreras, la barra de semanas y la URL serían dos formas de llegar a
  // clases que todavía no deberían poder reservarse.
  describe('ventana de reserva', () => {
    it('no deja avanzar más allá de la última semana reservable', async () => {
      vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([]);
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/reservas']}>
          <ReservasPage />
        </MemoryRouter>,
      );

      // Desde la semana en curso se puede avanzar una vez; ahí se acaba.
      const nextButton = screen.getByLabelText('Semana siguiente');
      expect(nextButton).toBeEnabled();

      await user.click(nextButton);

      expect(screen.getByLabelText('Semana siguiente')).toBeDisabled();
      expect(screen.getByText(/Las clases se abren semana a semana/)).toBeInTheDocument();
    });

    it('recorta al tope una fecha futura escrita a mano en la URL', async () => {
      vi.mocked(fetchClassSessionsByDateRange).mockResolvedValue([]);

      render(
        <MemoryRouter initialEntries={['/reservas?fecha=2099-07-23']}>
          <ReservasPage />
        </MemoryRouter>,
      );

      // Cae en la última semana reservable, no en el año 2099: la flecha
      // de avanzar ya está al tope.
      await screen.findByText('No hay clases programadas este día.');
      expect(screen.getByLabelText('Semana siguiente')).toBeDisabled();
    });
  });
});
