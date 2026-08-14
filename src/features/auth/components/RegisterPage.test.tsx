import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

// El formulario real ya tiene sus propios tests; aquí solo interesa a
// cuál de los dos finales lleva la página según lo que responda el
// registro, así que se sustituye por un botón que dispara cada caso.
vi.mock('@/features/auth/components/RegisterForm', () => ({
  RegisterForm: ({
    onSuccess,
  }: {
    onSuccess: (email: string, needsEmailConfirmation: boolean) => void;
  }) => (
    <>
      <button onClick={() => onSuccess('ana@example.com', true)}>
        simular-con-email
      </button>
      <button onClick={() => onSuccess('ana@example.com', false)}>
        simular-sin-email
      </button>
    </>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('muestra el aviso de revisar el email cuando hace falta confirmar', async () => {
    renderPage();

    screen.getByRole('button', { name: 'simular-con-email' }).click();

    await screen.findByText(/ana@example.com/);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  // Regresión: antes se mandaba SIEMPRE a "revisa tu email", así que con la
  // confirmación desactivada en Supabase el usuario quedaba esperando un
  // correo que no iba a llegar, con la sesión ya iniciada (ver DECISIONS.md).
  it('entra directo a las clases cuando el registro ya deja sesión iniciada', async () => {
    renderPage();

    screen.getByRole('button', { name: 'simular-sin-email' }).click();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/clases');
    });
    expect(screen.queryByText(/ana@example.com/)).toBeNull();
  });
});
