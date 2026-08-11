import { Link } from 'react-router-dom';

const TRUST_POINTS = [
  'Aforo controlado en tiempo real',
  'Cancela hasta 1 hora antes',
  'RGPD/LOPDGDD, también para menores',
];

export function LandingFooter() {
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-sm text-ink-faint">
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {TRUST_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="mt-3">
        © {new Date().getFullYear()} Gimnasio ·{' '}
        <Link
          to="/iniciar-sesion"
          className="underline-offset-2 hover:text-ink-muted hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </footer>
  );
}
