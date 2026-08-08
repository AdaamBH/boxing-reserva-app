import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@/test-utils';
import { ClassSessionCard } from './ClassSessionCard';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));
vi.mock('@/features/bookings/api/bookingsApi', () => ({
  bookClassSession: vi.fn(),
}));

import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';

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
  });

  it('muestra un texto de fallback cuando no hay entrenador disponible', () => {
    render(<ClassSessionCard session={BASE_SESSION} ocupadas={0} />);

    expect(screen.getByText('Con entrenador por asignar')).toBeInTheDocument();
  });

  it('muestra "Clase llena" cuando las plazas ocupadas igualan el aforo', () => {
    render(<ClassSessionCard session={BASE_SESSION} ocupadas={20} />);

    expect(screen.getByText('Clase llena')).toBeInTheDocument();
  });

  it('muestra las plazas libres cuando quedan huecos', () => {
    render(<ClassSessionCard session={BASE_SESSION} ocupadas={15} />);

    expect(screen.getByText('5 plazas libres')).toBeInTheDocument();
  });
});
