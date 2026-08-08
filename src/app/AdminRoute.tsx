import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageFallback } from '@/components/PageFallback';

interface AdminRouteProps {
  children: ReactNode;
}

// La comprobación real de permisos vive en RLS (is_admin() en Postgres,
// ver SECURITY.md) — esto es solo UX: evita que un alumno vea un
// formulario de admin que de todas formas RLS rechazaría al guardar.
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
