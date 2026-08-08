import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PasswordResetRequestForm } from '@/features/auth/components/PasswordResetRequestForm';
import { CheckEmailNotice } from '@/features/auth/components/CheckEmailNotice';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function PasswordResetRequestPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  return (
    <AuthLayout title="Recuperar contraseña">
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
    </AuthLayout>
  );
}
