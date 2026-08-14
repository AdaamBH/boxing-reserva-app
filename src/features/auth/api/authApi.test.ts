import { beforeEach, describe, expect, it, vi } from 'vitest';

const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPasswordMock(...args),
      signUp: (...args: unknown[]) => signUpMock(...args),
    },
  },
}));

const { signIn, signUp } = await import('@/features/auth/api/authApi');

const registerValues = {
  email: 'ana@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
  nombre: 'Ana',
  apellidos: 'García López',
  telefono: '600123456',
  fechaNacimiento: '1990-05-15',
};

describe('signIn', () => {
  beforeEach(() => {
    signInWithPasswordMock.mockReset();
  });

  it('llama a Supabase con el email y la contraseña tal cual', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    await signIn('ana@example.com', 'password123');

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'password123',
    });
  });

  it('no lanza si Supabase devuelve éxito', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    await expect(signIn('ana@example.com', 'password123')).resolves.toBeUndefined();
  });

  it('traduce credenciales inválidas a un mensaje claro en español', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    await expect(signIn('ana@example.com', 'mal')).rejects.toThrow(
      'Email o contraseña incorrectos.',
    );
  });

  it('traduce email no confirmado a un mensaje claro en español', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: 'Email not confirmed' },
    });

    await expect(signIn('ana@example.com', 'password123')).rejects.toThrow(
      'Todavía no has confirmado tu email. Revisa tu bandeja de entrada.',
    );
  });

  it('traduce el límite de intentos a un mensaje claro en español', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: 'Email rate limit exceeded' },
    });

    await expect(signIn('ana@example.com', 'password123')).rejects.toThrow(
      'Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.',
    );
  });

  it('cae en un mensaje genérico ante un error no reconocido, sin exponer el texto técnico', async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: 'unexpected_internal_error_xyz' },
    });

    await expect(signIn('ana@example.com', 'password123')).rejects.toThrow(
      'Algo ha fallado. Inténtalo de nuevo en unos segundos.',
    );
  });
});

describe('signUp', () => {
  beforeEach(() => {
    signUpMock.mockReset();
  });

  it('envía los datos de perfil como metadata de usuario', async () => {
    signUpMock.mockResolvedValue({ data: { session: null, user: null }, error: null });

    await signUp(registerValues);

    expect(signUpMock).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'password123',
      options: {
        data: {
          nombre: 'Ana',
          apellidos: 'García López',
          telefono: '600123456',
          fecha_nacimiento: '1990-05-15',
        },
      },
    });
  });

  // Los dos casos que dependen de si "Confirm email" está activo en el
  // proyecto de Supabase: la respuesta manda, no una suposición fija.
  it('pide confirmar el email cuando Supabase no devuelve sesión', async () => {
    signUpMock.mockResolvedValue({ data: { session: null, user: null }, error: null });

    const result = await signUp(registerValues);

    expect(result).toEqual({ needsEmailConfirmation: true });
  });

  it('no pide confirmar el email cuando el registro ya devuelve sesión', async () => {
    signUpMock.mockResolvedValue({
      data: { session: { access_token: 'token-1' }, user: { id: 'user-1' } },
      error: null,
    });

    const result = await signUp(registerValues);

    expect(result).toEqual({ needsEmailConfirmation: false });
  });

  it('traduce un email ya registrado a un mensaje claro en español', async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'User already registered' },
    });

    await expect(signUp(registerValues)).rejects.toThrow(
      'Ya existe una cuenta con este email. ¿Quizás quieres iniciar sesión?',
    );
  });
});
