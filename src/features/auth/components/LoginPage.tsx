import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Iniciar sesión">
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
    </AuthLayout>
  );
}
