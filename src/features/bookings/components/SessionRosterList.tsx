import { useSessionRoster } from '@/features/bookings/hooks/useSessionRoster';
import type { RosterEntry } from '@/features/bookings/types';

interface SessionRosterListProps {
  sessionId: string;
}

function RosterGroup({ title, entries }: { title: string; entries: RosterEntry[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        {title} ({entries.length})
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">Nadie por aquí todavía.</p>
      ) : (
        <ol className="mt-1 flex flex-col gap-0.5 text-sm text-slate-600">
          {entries.map((entry) => (
            <li key={entry.orden}>
              {entry.orden}. {entry.display_name}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function SessionRosterList({ sessionId }: SessionRosterListProps) {
  const { data: roster, isLoading, error } = useSessionRoster(sessionId, true);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {isLoading && <p className="text-sm text-slate-500">Cargando lista…</p>}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          No se ha podido cargar la lista de la clase. Inténtalo de nuevo en unos
          segundos.
        </p>
      )}

      {roster && (
        <>
          <RosterGroup
            title="Dentro de la clase"
            entries={roster.filter((entry) => entry.estado === 'confirmada')}
          />
          <RosterGroup
            title="Lista de espera"
            entries={roster.filter((entry) => entry.estado === 'en_espera')}
          />
        </>
      )}
    </div>
  );
}
