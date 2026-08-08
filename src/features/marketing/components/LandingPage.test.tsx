import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './LandingPage';
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

function renderLandingPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/clases" element={<p>Clases</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('muestra un estado de carga mientras se resuelve la sesión', () => {
    mockAuth({ isLoading: true });
    renderLandingPage();

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('redirige a /clases si ya hay sesión iniciada', () => {
    mockAuth({ isAuthenticated: true });
    renderLandingPage();

    expect(screen.getByText('Clases')).toBeInTheDocument();
  });

  it('muestra el contenido de la landing si no hay sesión', () => {
    mockAuth({ isAuthenticated: false });
    renderLandingPage();

    expect(
      screen.getByRole('heading', { name: 'Reserva tu clase de boxeo en segundos' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Reservar ahora' }).length,
    ).toBeGreaterThan(0);
  });
});
