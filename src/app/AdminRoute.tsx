import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

// La comprobación real de permisos vive en RLS (is_admin() en Postgres,
// ver SECURITY.md) — esto es solo UX: evita que un alumno vea un
// formulario de admin que de todas formas RLS rechazaría al guardar.
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
