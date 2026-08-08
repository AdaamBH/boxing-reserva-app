import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold text-ink">Iniciar sesión</h1>
      {/* SessionProvider recoge la sesión nueva solo con el listener de
          Supabase; no hace falta pasarle nada aquí, solo navegar. */}
      <LoginForm onSuccess={() => navigate('/clases')} />
      <div className="flex flex-col items-center gap-2 text-sm text-ink-muted">
        <Link to="/recuperar-contrasena" className="underline-offset-2 hover:underline">
          ¿Has olvidado tu contraseña?
        </Link>
        <Link to="/registro" className="underline-offset-2 hover:underline">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </div>
  );
}
