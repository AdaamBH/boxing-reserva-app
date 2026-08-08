import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { CheckEmailNotice } from '@/features/auth/components/CheckEmailNotice';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  return (
    <AuthLayout title="Crear cuenta">
      {registeredEmail ? (
        <CheckEmailNotice email={registeredEmail} context="registro" />
      ) : (
        <>
          <RegisterForm onSuccess={setRegisteredEmail} />
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
