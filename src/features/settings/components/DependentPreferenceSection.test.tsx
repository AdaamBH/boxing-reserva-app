import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test-utils';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { DependentPreferenceSection } from './DependentPreferenceSection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';
import { updateDefaultDependent } from '@/features/settings/api/settingsApi';
import type { Dependent } from '@/features/dependents/types';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/features/dependents/api/dependentsApi', () => ({
  fetchMyDependents: vi.fn(),
}));
vi.mock('@/features/settings/api/settingsApi', () => ({
  updateDefaultDependent: vi.fn(),
}));

function mockAuth(defaultDependentId: string | null) {
  vi.mocked(useAuth).mockReturnValue({
    profile: { default_dependent_id: defaultDependentId },
  } as ReturnType<typeof useAuth>);
}

function buildDependent(overrides: Partial<Dependent>): Dependent {
  return {
    id: 'dep-1',
    nombre: 'Lucía',
    apellidos: 'Pérez',
    parent_user_id: 'user-1',
    fecha_nacimiento: '2015-01-01',
    relacion: 'madre',
    created_at: '2026-01-01T00:00:00.000Z',
    consent_given_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderSection() {
  return render(
    <MemoryRouter>
      <DependentPreferenceSection />
    </MemoryRouter>,
  );
}

describe('DependentPreferenceSection', () => {
  beforeEach(() => {
    vi.mocked(updateDefaultDependent).mockReset().mockResolvedValue(undefined);
  });

  it('sin dependientes, solo muestra el enlace para añadir uno', async () => {
    mockAuth(null);
    vi.mocked(fetchMyDependents).mockResolvedValue([]);

    renderSection();

    await screen.findByText('Todavía no tienes ningún dependiente registrado.');
    expect(
      screen.getByRole('link', {
        name: '¿Reservas para un menor a tu cargo? Añade un dependiente',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('con un solo dependiente, activar el interruptor lo selecciona directamente sin desplegable', async () => {
    mockAuth(null);
    vi.mocked(fetchMyDependents).mockResolvedValue([buildDependent({})]);
    const user = userEvent.setup();

    renderSection();
    await user.click(await screen.findByRole('switch'));

    expect(updateDefaultDependent).toHaveBeenCalledWith('dep-1');
    expect(screen.queryByLabelText('¿Para quién?')).not.toBeInTheDocument();
  });

  it('con varios dependientes, muestra el desplegable cuando está activado', async () => {
    mockAuth('dep-1');
    vi.mocked(fetchMyDependents).mockResolvedValue([
      buildDependent({}),
      buildDependent({ id: 'dep-2', nombre: 'Marcos' }),
    ]);
    const user = userEvent.setup();

    renderSection();
    await user.selectOptions(await screen.findByLabelText('¿Para quién?'), 'dep-2');

    expect(updateDefaultDependent).toHaveBeenCalledWith('dep-2');
  });

  it('desactivar el interruptor limpia el dependiente por defecto', async () => {
    mockAuth('dep-1');
    vi.mocked(fetchMyDependents).mockResolvedValue([buildDependent({})]);
    const user = userEvent.setup();

    renderSection();
    await user.click(await screen.findByRole('switch'));

    expect(updateDefaultDependent).toHaveBeenCalledWith(null);
  });
});
