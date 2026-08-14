import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { CheckEmailNotice } from '@/features/auth/components/CheckEmailNotice';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  // Dos finales posibles según cómo esté configurado Supabase: si el
  // registro devuelve sesión (confirmación por email desactivada), se entra
  // directo a la app igual que tras un login; si no, se espera al correo.
  // SessionProvider ya recoge la sesión nueva con el listener de Supabase,
  // así que aquí solo hay que navegar (mismo patrón que LoginPage).
  function handleSuccess(email: string, needsEmailConfirmation: boolean) {
    if (needsEmailConfirmation) {
      setRegisteredEmail(email);
      return;
    }
    navigate('/clases');
  }

  return (
    <AuthLayout title="Crear cuenta">
      {registeredEmail ? (
        <CheckEmailNotice email={registeredEmail} context="registro" />
      ) : (
        <>
          <RegisterForm onSuccess={handleSuccess} />
          <Link
            to="/iniciar-sesion"
            className="text-center text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
