import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { signIn } from '@/features/auth/api/authApi';

vi.mock('@/features/auth/api/authApi', () => ({
  signIn: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
  });

  it('llama a signIn con email y contraseña y avisa al terminar', async () => {
    vi.mocked(signIn).mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(signIn).toHaveBeenCalledWith('ana@example.com', 'password123');
  });

  it('muestra el error traducido si signIn falla, sin avisar de éxito', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Email o contraseña incorrectos.'));
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'mal');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Email o contraseña incorrectos.');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
