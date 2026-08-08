import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageFallback } from '@/components/PageFallback';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <>{children}</>;
}
