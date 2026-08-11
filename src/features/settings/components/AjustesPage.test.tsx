import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AjustesPage } from './AjustesPage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signOut } from '@/features/auth/api/authApi';
import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/features/auth/api/authApi', () => ({
  signOut: vi.fn(),
}));
vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  vi.mocked(useAuth).mockReturnValue({
    session: null,
    user: null,
    profile: null,
    isAuthenticated: true,
    isAdmin: false,
    isLoading: false,
    profileError: null,
    ...overrides,
  } as ReturnType<typeof useAuth>);
}

describe('AjustesPage', () => {
  beforeEach(() => {
    vi.mocked(fetchMyDependents).mockReset();
    vi.mocked(fetchMyDependents).mockResolvedValue([]);
  });

  it('muestra el nombre y el email de la cuenta', () => {
    mockAuth({
      user: { email: 'alumno@example.com' } as ReturnType<typeof useAuth>['user'],
      profile: {
        id: 'user-1',
        nombre: 'Ana',
        apellidos: 'García',
        telefono: '600000000',
        fecha_nacimiento: '1995-01-01',
        role: 'alumno',
        created_at: '2026-01-01T00:00:00.000Z',
        default_dependent_id: null,
      } as ReturnType<typeof useAuth>['profile'],
    });

    render(
      <MemoryRouter>
        <AjustesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('alumno@example.com')).toBeInTheDocument();
  });

  it('cierra sesión al pulsar el botón', async () => {
    mockAuth({});
    vi.mocked(signOut).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AjustesPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
