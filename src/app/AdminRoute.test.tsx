import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { useAuth } from '@/features/auth/hooks/useAuth';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>>) {
  vi.mocked(useAuth).mockReturnValue({
    session: null,
    user: null,
    profile: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    profileError: null,
    ...overrides,
  } as ReturnType<typeof useAuth>);
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <p>Contenido admin</p>
            </AdminRoute>
          }
        />
        <Route path="/" element={<p>Inicio</p>} />
        <Route path="/iniciar-sesion" element={<p>Login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminRoute', () => {
  it('redirige a iniciar sesión si no hay sesión', () => {
    mockAuth({ isAuthenticated: false });
    renderAdminRoute();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('redirige a inicio si está autenticado pero no es admin', () => {
    mockAuth({ isAuthenticated: true, isAdmin: false });
    renderAdminRoute();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('muestra el contenido si es admin', () => {
    mockAuth({ isAuthenticated: true, isAdmin: true });
    renderAdminRoute();
    expect(screen.getByText('Contenido admin')).toBeInTheDocument();
  });
});
