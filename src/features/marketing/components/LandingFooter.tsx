import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="border-t border-line px-4 py-6 text-center text-sm text-ink-faint">
      <p>
        © {new Date().getFullYear()} Gimnasio ·{' '}
        <Link to="/iniciar-sesion" className="underline-offset-2 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </footer>
  );
}
