import { Link } from 'react-router-dom';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="font-display text-lg font-semibold tracking-wide text-ink uppercase">
          Gimnasio
        </span>
        <nav className="flex items-center gap-3">
          <Link
            to="/iniciar-sesion"
            className="text-sm font-medium text-ink-muted hover:text-ink"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Reservar ahora
          </Link>
        </nav>
      </div>
    </header>
  );
}
