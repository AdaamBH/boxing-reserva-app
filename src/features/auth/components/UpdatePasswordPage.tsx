import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePasswordRecoverySession } from '@/features/auth/hooks/usePasswordRecoverySession';
import { UpdatePasswordForm } from '@/features/auth/components/UpdatePasswordForm';

export function UpdatePasswordPage() {
  const recoveryStatus = usePasswordRecoverySession();
  const [isDone, setIsDone] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold text-ink">Nueva contraseña</h1>

      {isDone ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-canvas-raised p-6 text-center">
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
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-canvas-raised p-6 text-center">
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
    </div>
  );
}
