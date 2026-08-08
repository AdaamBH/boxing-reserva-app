import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LandingHeader } from '@/features/marketing/components/LandingHeader';
import { LandingHero } from '@/features/marketing/components/LandingHero';
import { LandingFeatures } from '@/features/marketing/components/LandingFeatures';
import { LandingHowItWorks } from '@/features/marketing/components/LandingHowItWorks';
import { LandingCta } from '@/features/marketing/components/LandingCta';
import { LandingFooter } from '@/features/marketing/components/LandingFooter';

// "/" es pública (a diferencia de todo lo demás, que pasa por
// ProtectedRoute) — pero quien ya tiene sesión no debería ver contenido
// de marketing cada vez que entra, va directo a /clases.
export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="text-sm text-ink-faint">Cargando…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/clases" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
