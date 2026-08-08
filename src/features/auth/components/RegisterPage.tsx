import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { CheckEmailNotice } from '@/features/auth/components/CheckEmailNotice';

export function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold text-ink">Crear cuenta</h1>
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
    </div>
  );
}
