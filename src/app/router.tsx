import { Routes, Route } from 'react-router-dom';

// Placeholder de Fase 0: confirma que el andamiaje (Vite + React + Router)
// funciona de principio a fin. Las rutas reales (login, listado de clases,
// reservas, panel de admin...) se añaden a partir de la Fase 1, una por una,
// según TASK_WORKFLOW.md — no se crean de golpe sin las pantallas detrás.
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
    </Routes>
  );
}

function HomePlaceholder() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <p className="text-sm text-slate-500">
        Fase 0 completada: el andamiaje del proyecto funciona correctamente.
      </p>
    </main>
  );
}
