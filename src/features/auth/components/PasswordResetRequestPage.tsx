import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PasswordResetRequestForm } from '@/features/auth/components/PasswordResetRequestForm';
import { CheckEmailNotice } from '@/features/auth/components/CheckEmailNotice';

export function PasswordResetRequestPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold text-ink">
        Recuperar contraseña
      </h1>
      {submittedEmail ? (
        <CheckEmailNotice email={submittedEmail} context="recuperacion-contrasena" />
      ) : (
        <>
          <PasswordResetRequestForm onSuccess={setSubmittedEmail} />
          <Link
            to="/iniciar-sesion"
            className="text-center text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </>
      )}
    </div>
  );
}
