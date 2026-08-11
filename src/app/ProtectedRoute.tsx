import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { PageFallback } from '@/components/PageFallback';
import { Button } from '@/components/Button';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Recargar (getSession() + la consulta de perfil, de cero) basta si el
// fallo fue una red que iba mal en ese momento. Si en cambio lo que hay
// guardado en este navegador es una sesión corrupta/caducada (un access
// token viejo que ya no vale), recargar repite exactamente el mismo
// error para siempre — hace falta borrar esa sesión local y volver a
// entrar desde cero, por eso el segundo botón además de "Reintentar".
async function handleSignOutAndRetry() {
  await supabase.auth.signOut();
  window.location.href = '/iniciar-sesion';
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profileError } = useAuth();

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  // Sin esto, un fallo o timeout al cargar el perfil (ver useProfile.ts)
  // dejaba la pantalla sin nada útil que hacer — ProtectedRoute nunca
  // comprobaba este estado.
  if (profileError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-xs text-sm text-danger-500">
          No se ha podido cargar tu perfil. Comprueba tu conexión a internet.
        </p>
        <p className="max-w-xs text-xs text-ink-faint">
          Detalle técnico: {profileError.message}
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
          <Button type="button" variant="secondary" onClick={handleSignOutAndRetry}>
            Cerrar sesión y volver a entrar
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
