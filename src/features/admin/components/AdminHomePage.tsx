import { Link } from 'react-router-dom';
import type { ComponentType } from 'react';
import { CalendarIcon, RepeatIcon } from '@/components/icons';

interface AdminLink {
  to: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

const ADMIN_LINKS: AdminLink[] = [
  {
    to: '/admin/plantillas',
    label: 'Plantillas de clase',
    description: 'El horario recurrente semanal del gimnasio.',
    icon: RepeatIcon,
  },
  {
    to: '/admin/sesiones',
    label: 'Sesiones de clase',
    description: 'Sesiones sueltas y cancelaciones puntuales.',
    icon: CalendarIcon,
  },
];

export function AdminHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">
        Panel de administración
      </h1>
      <nav className="flex flex-col gap-3">
        {ADMIN_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 rounded-xl border border-line bg-canvas-raised p-4 transition-colors hover:bg-chalk"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-ink">{item.label}</span>
              <span className="text-sm text-ink-muted">{item.description}</span>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
