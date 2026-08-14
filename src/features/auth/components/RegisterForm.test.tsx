import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { signUp } from '@/features/auth/api/authApi';

vi.mock('@/features/auth/api/authApi', () => ({
  signUp: vi.fn(),
}));

const validInput = {
  nombre: 'Ana',
  apellidos: 'García López',
  email: 'ana@example.com',
  telefono: '600123456',
  fechaNacimiento: '1990-05-15',
  password: 'password123',
  passwordConfirmation: 'password123',
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre'), validInput.nombre);
  await user.type(screen.getByLabelText('Apellidos'), validInput.apellidos);
  await user.type(screen.getByLabelText('Email'), validInput.email);
  await user.type(screen.getByLabelText('Teléfono'), validInput.telefono);
  // Los inputs type="date" no se rellenan de forma fiable simulando
  // pulsaciones de teclado segmento a segmento en el entorno de test — se
  // fija el valor directamente, la forma habitual de probar este campo.
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), {
    target: { value: validInput.fechaNacimiento },
  });
  await user.type(screen.getByLabelText('Contraseña'), validInput.password);
  await user.type(
    screen.getByLabelText('Confirma tu contraseña'),
    validInput.passwordConfirmation,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.mocked(signUp).mockReset();
  });

  it('llama a signUp con los datos del formulario y avisa con el email al terminar', async () => {
    vi.mocked(signUp).mockResolvedValue({ needsEmailConfirmation: true });
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<RegisterForm onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(validInput.email, true);
    });
    expect(signUp).toHaveBeenCalledWith(validInput);
  });

  it('propaga needsEmailConfirmation=false cuando el registro ya deja sesión iniciada', async () => {
    vi.mocked(signUp).mockResolvedValue({ needsEmailConfirmation: false });
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<RegisterForm onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(validInput.email, false);
    });
  });

  it('muestra el error traducido si signUp falla, sin avisar de éxito', async () => {
    const errorMessage =
      'Ya existe una cuenta con este email. ¿Quizás quieres iniciar sesión?';
    vi.mocked(signUp).mockRejectedValue(new Error(errorMessage));
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<RegisterForm onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(errorMessage);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('no llama a signUp si las contraseñas no coinciden', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(<RegisterForm onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText('Confirma tu contraseña'));
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'otra-contraseña');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    // findByText ya lanza y falla el test si no aparece — no hace falta
    // ningún matcher adicional para confirmar que existe.
    await screen.findByText('Las contraseñas no coinciden');
    expect(signUp).not.toHaveBeenCalled();
  });
});
