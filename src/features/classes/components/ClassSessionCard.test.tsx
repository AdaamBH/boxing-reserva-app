import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { render } from '@/test-utils';
import { ClassSessionCard } from './ClassSessionCard';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

// ClassSessionCard renderiza un <Link> (react-router-dom), que necesita
// un Router alrededor para no lanzar — MemoryRouter en cada render, igual
// que en AdminRoute.test.tsx.
function renderCard(props: ComponentProps<typeof ClassSessionCard>) {
  return render(
    <MemoryRouter>
      <ClassSessionCard {...props} />
    </MemoryRouter>,
  );
}

vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));
vi.mock('@/features/bookings/api/bookingsApi', () => ({
  bookClassSession: vi.fn(),
}));
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';
import { useAuth } from '@/features/auth/hooks/useAuth';

const BASE_SESSION: ClassSessionWithTrainer = {
  id: '1',
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
};

describe('ClassSessionCard', () => {
  beforeEach(() => {
    vi.mocked(fetchMyDependents).mockReset();
    vi.mocked(fetchMyDependents).mockResolvedValue([]);
    vi.mocked(useAuth).mockReturnValue({
      profile: { default_dependent_id: null },
    } as ReturnType<typeof useAuth>);
  });

  it('muestra el horario, el tipo de clase, el nivel y el entrenador', () => {
    renderCard({ session: BASE_SESSION });

    expect(screen.getByText('18:00–19:00')).toBeInTheDocument();
    expect(screen.getByText('Boxeo')).toBeInTheDocument();
    expect(screen.getByText('· Intermedio')).toBeInTheDocument();
    expect(screen.getByText('entrenador por asignar')).toBeInTheDocument();
  });

  it('no muestra el enlace "Ver Clase" si el usuario no está reservado', () => {
    renderCard({ session: BASE_SESSION });

    expect(screen.queryByRole('link', { name: 'Ver Clase' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reservar' })).toBeInTheDocument();
  });

  it('muestra "Ya estás apuntado" y "Ver Clase" cuando hay reserva confirmada', () => {
    renderCard({
      session: BASE_SESSION,
      status: { type: 'confirmed', bookingId: 'booking-1' },
    });

    expect(screen.getByText('Ya estás apuntado ✓')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Clase' })).toHaveAttribute(
      'href',
      '/clases/1/lista',
    );
    expect(screen.queryByRole('button', { name: 'Reservar' })).not.toBeInTheDocument();
  });

  it('muestra "En lista de espera" y ningún enlace cuando está en espera', () => {
    renderCard({
      session: BASE_SESSION,
      status: { type: 'waitlisted', waitlistEntryId: 'wl-1' },
    });

    expect(screen.getByText('En lista de espera')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver Clase' })).not.toBeInTheDocument();
  });
});
