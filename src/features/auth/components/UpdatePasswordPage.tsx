import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePasswordRecoverySession } from '@/features/auth/hooks/usePasswordRecoverySession';
import { UpdatePasswordForm } from '@/features/auth/components/UpdatePasswordForm';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function UpdatePasswordPage() {
  const recoveryStatus = usePasswordRecoverySession();
  const [isDone, setIsDone] = useState(false);

  return (
    <AuthLayout title="Nueva contraseña">
      {isDone ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-base text-ink-muted">
            Contraseña actualizada. Ya puedes iniciar sesión con ella.
          </p>
          <Link
            to="/iniciar-sesion"
            className="text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      ) : recoveryStatus === 'esperando' ? (
        <p className="text-center text-sm text-ink-faint">Comprobando el enlace…</p>
      ) : recoveryStatus === 'no-detectada' ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-base text-ink-muted">
            Este enlace no es válido o ha caducado. Solicita uno nuevo.
          </p>
          <Link
            to="/recuperar-contrasena"
            className="text-sm text-ink-muted underline-offset-2 hover:underline"
          >
            Solicitar enlace nuevo
          </Link>
        </div>
      ) : (
        <UpdatePasswordForm onSuccess={() => setIsDone(true)} />
      )}
    </AuthLayout>
  );
}
