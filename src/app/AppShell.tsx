import { NavLink, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import type { ComponentType } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageFallback } from '@/components/PageFallback';
import {
  CalendarIcon,
  ChecklistIcon,
  PeopleIcon,
  SettingsIcon,
  ShieldIcon,
} from '@/components/icons';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const RESERVAS_ITEM: NavItem = { to: '/clases', label: 'Reservas', icon: CalendarIcon };
const MIS_RESERVAS_ITEM: NavItem = {
  to: '/mis-reservas',
  label: 'Mis reservas',
  icon: ChecklistIcon,
};
const AJUSTES_ITEM: NavItem = { to: '/ajustes', label: 'Ajustes', icon: SettingsIcon };
// Los entrenadores de una clase ya se ven en su propia tarjeta (ver
// ClassSessionCard) — un alumno no necesita un listado aparte. El admin sí
// lo conserva por si lo necesita para gestión.
const ENTRENADORES_ITEM: NavItem = {
  to: '/entrenadores',
  label: 'Entrenadores',
  icon: PeopleIcon,
};
const ADMIN_ITEM: NavItem = { to: '/admin', label: 'Admin', icon: ShieldIcon };

// Layout de las páginas autenticadas: cabecera con nav en escritorio +
// barra de pestañas fija abajo en móvil (uso real: de pie en el gimnasio o
// de camino, no sentado frente a un monitor). Envuelve todo lo que ya pasa
// por ProtectedRoute — ver router.tsx.
export function AppShell() {
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [RESERVAS_ITEM, MIS_RESERVAS_ITEM, ENTRENADORES_ITEM, AJUSTES_ITEM, ADMIN_ITEM]
    : [RESERVAS_ITEM, MIS_RESERVAS_ITEM, AJUSTES_ITEM];

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
      </header>

      <main className="flex-1 pb-20 md:pb-8">
        {/* Cada página autenticada es un chunk aparte (ver router.tsx) —
            este Suspense es lo que evita que cambiar de pestaña haga
            desaparecer la cabecera/nav mientras se descarga, solo se ve
            la espera en el área de contenido. */}
        <Suspense fallback={<PageFallback minHeightClassName="min-h-[50vh]" />}>
          <Outlet />
        </Suspense>
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
