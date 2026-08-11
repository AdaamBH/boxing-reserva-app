import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageFallback } from '@/components/PageFallback';
import { Button } from '@/components/Button';

interface ProtectedRouteProps {
  children: ReactNode;
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
  // comprobaba este estado. Recargar vuelve a intentar sesión + perfil
  // desde cero, no solo la consulta.
  if (profileError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-xs text-sm text-danger-500">
          No se ha podido cargar tu perfil. Comprueba tu conexión a internet.
        </p>
        <div className="w-full max-w-xs">
          <Button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
