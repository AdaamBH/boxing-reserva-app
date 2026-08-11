import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@/test-utils';
import { SessionRosterPage } from './SessionRosterPage';
import { fetchClassSessionById } from '@/features/classes/api/classesApi';
import { fetchSessionRoster } from '@/features/bookings/api/bookingsApi';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

vi.mock('@/features/classes/api/classesApi', () => ({
  fetchClassSessionById: vi.fn(),
}));
vi.mock('@/features/bookings/api/bookingsApi', () => ({
  fetchSessionRoster: vi.fn(),
}));

const SESSION: ClassSessionWithTrainer = {
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
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/reservas/session-1/lista']}>
      <Routes>
        <Route path="/reservas/:sessionId/lista" element={<SessionRosterPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SessionRosterPage', () => {
  beforeEach(() => {
    vi.mocked(fetchClassSessionById).mockReset();
    vi.mocked(fetchSessionRoster).mockReset();
  });

  it('muestra los datos de la clase y la lista de reservas', async () => {
    vi.mocked(fetchClassSessionById).mockResolvedValue(SESSION);
    vi.mocked(fetchSessionRoster).mockResolvedValue([
      { estado: 'confirmada', display_name: 'Ana G.', orden: 1 },
    ]);

    renderPage();

    await screen.findByRole('heading', { name: 'Boxeo' });
    expect(fetchClassSessionById).toHaveBeenCalledWith('session-1');
    expect(fetchSessionRoster).toHaveBeenCalledWith('session-1');
    await screen.findByText('Ana G.');
  });

  it('muestra un error si no se puede cargar la clase', async () => {
    vi.mocked(fetchClassSessionById).mockRejectedValue(new Error('fallo'));
    vi.mocked(fetchSessionRoster).mockResolvedValue([]);

    renderPage();

    await screen.findByText(
      'No se ha podido cargar la clase. Inténtalo de nuevo en unos segundos.',
    );
  });
});
