import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSignOut } from '@/features/auth/hooks/useSignOut';
import {
  CalendarIcon,
  ChecklistIcon,
  LogoutIcon,
  PeopleIcon,
  ShieldIcon,
} from '@/components/icons';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { to: '/clases', label: 'Clases', icon: CalendarIcon },
  { to: '/mis-reservas', label: 'Mis reservas', icon: ChecklistIcon },
  { to: '/entrenadores', label: 'Entrenadores', icon: PeopleIcon },
];

// Layout de las páginas autenticadas: cabecera con nav en escritorio +
// barra de pestañas fija abajo en móvil (uso real: de pie en el gimnasio o
// de camino, no sentado frente a un monitor). Envuelve todo lo que ya pasa
// por ProtectedRoute — ver router.tsx.
export function AppShell() {
  const { isAdmin } = useAuth();
  const { mutate: doSignOut, isPending } = useSignOut();
  const navigate = useNavigate();

  const items = isAdmin
    ? [...BASE_NAV_ITEMS, { to: '/admin', label: 'Admin', icon: ShieldIcon }]
    : BASE_NAV_ITEMS;

  function handleSignOut() {
    doSignOut(undefined, {
      onSuccess: () => navigate('/iniciar-sesion', { replace: true }),
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur">
        <span className="font-display text-lg font-semibold tracking-wide text-ink uppercase">
          Gimnasio
        </span>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-ink-muted hover:bg-chalk hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          aria-label="Cerrar sesión"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-chalk hover:text-ink disabled:opacity-50"
        >
          <LogoutIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 pb-20 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas-raised/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-ink-faint'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
