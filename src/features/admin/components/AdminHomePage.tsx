import { Link } from 'react-router-dom';

export function AdminHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Panel de administración</h1>
      <nav className="flex flex-col gap-3">
        <Link
          to="/admin/plantillas"
          className="rounded-lg border border-line bg-canvas-raised p-4 text-base font-medium text-ink hover:bg-chalk"
        >
          Plantillas de clase
        </Link>
        <Link
          to="/admin/sesiones"
          className="rounded-lg border border-line bg-canvas-raised p-4 text-base font-medium text-ink hover:bg-chalk"
        >
          Sesiones de clase
        </Link>
      </nav>
    </div>
  );
}
