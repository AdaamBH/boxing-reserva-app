import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { SessionRosterList } from './SessionRosterList';
import { fetchSessionRoster } from '@/features/bookings/api/bookingsApi';

vi.mock('@/features/bookings/api/bookingsApi', () => ({
  fetchSessionRoster: vi.fn(),
}));

describe('SessionRosterList', () => {
  beforeEach(() => {
    vi.mocked(fetchSessionRoster).mockReset();
  });

  it('separa confirmados y lista de espera en dos grupos, cada uno en su orden', async () => {
    vi.mocked(fetchSessionRoster).mockResolvedValue([
      { estado: 'confirmada', display_name: 'Ana G.', orden: 1 },
      { estado: 'confirmada', display_name: 'Bruno D.', orden: 2 },
      { estado: 'en_espera', display_name: 'Lucas P.', orden: 1 },
    ]);

    render(<SessionRosterList sessionId="session-1" />);

    const confirmados = await screen.findByText('Dentro de la clase (2)');
    const confirmadosList = confirmados.nextElementSibling;
    expect(confirmadosList).toHaveTextContent('Ana G.');
    expect(confirmadosList).toHaveTextContent('Bruno D.');

    const espera = screen.getByText('Lista de espera (1)');
    expect(espera.nextElementSibling).toHaveTextContent('Lucas P.');
  });

  it('muestra un mensaje cuando un grupo está vacío', async () => {
    vi.mocked(fetchSessionRoster).mockResolvedValue([
      { estado: 'confirmada', display_name: 'Ana G.', orden: 1 },
    ]);

    render(<SessionRosterList sessionId="session-1" />);

    await screen.findByText('Dentro de la clase (1)');
    expect(screen.getByText('Lista de espera (0)')).toBeInTheDocument();
    expect(screen.getByText('Nadie por aquí todavía.')).toBeInTheDocument();
  });

  it('muestra un error si la carga falla', async () => {
    vi.mocked(fetchSessionRoster).mockRejectedValue(new Error('fallo'));

    render(<SessionRosterList sessionId="session-1" />);

    await screen.findByText(
      'No se ha podido cargar la lista de la clase. Inténtalo de nuevo en unos segundos.',
    );
  });
});
