import { useClassSessions } from '@/features/classes/hooks/useClassSessions';
import { ClassSessionCard } from '@/features/classes/components/ClassSessionCard';
import { useSessionOccupancy } from '@/features/bookings/hooks/useSessionOccupancy';

export function ClassSessionsPage() {
  const { data: sessions, isLoading, error } = useClassSessions();
  const { data: occupancy } = useSessionOccupancy(
    sessions?.map((session) => session.id) ?? [],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Clases disponibles</h1>

      {isLoading && <p className="text-sm text-slate-500">Cargando clases…</p>}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          No se han podido cargar las clases. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {sessions?.length === 0 && (
        <p className="text-sm text-slate-500">No hay clases programadas por ahora.</p>
      )}

      {sessions && sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <ClassSessionCard
              key={session.id}
              session={session}
              ocupadas={occupancy?.[session.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
