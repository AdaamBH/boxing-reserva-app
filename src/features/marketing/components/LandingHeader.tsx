import { Link } from 'react-router-dom';
import { LandingCtaButton } from '@/features/marketing/components/LandingCtaButton';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-wide text-ink uppercase">
          Gimnasio
          <span className="h-1.5 w-1.5 rounded-full bg-rope" aria-hidden="true" />
        </span>
        <nav className="flex items-center gap-3">
          <Link
            to="/iniciar-sesion"
            className="rounded-md px-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            Iniciar sesión
          </Link>
          <LandingCtaButton to="/registro" size="sm">
            Reservar ahora
          </LandingCtaButton>
        </nav>
      </div>
    </header>
  );
}
