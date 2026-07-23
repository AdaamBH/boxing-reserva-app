import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordResetRequestForm } from './PasswordResetRequestForm';
import { requestPasswordReset } from '@/features/auth/api/authApi';

vi.mock('@/features/auth/api/authApi', () => ({
  requestPasswordReset: vi.fn(),
}));

describe('PasswordResetRequestForm', () => {
  beforeEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  it('llama a requestPasswordReset con el email y avisa al terminar', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<PasswordResetRequestForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Email'), 'ana@example.com');
    await user.click(
      screen.getByRole('button', { name: 'Enviar enlace de recuperación' }),
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('ana@example.com');
    });
  });

  it('rechaza un email con formato inválido sin llamar a requestPasswordReset', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<PasswordResetRequestForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Email'), 'no-es-un-email');
    await user.click(
      screen.getByRole('button', { name: 'Enviar enlace de recuperación' }),
    );

    await screen.findByText('Introduce un email válido');
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });
});
