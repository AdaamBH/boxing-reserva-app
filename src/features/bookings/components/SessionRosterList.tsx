import { useSessionRoster } from '@/features/bookings/hooks/useSessionRoster';
import type { RosterEntry } from '@/features/bookings/types';

interface SessionRosterListProps {
  sessionId: string;
}

interface RosterGroupProps {
  title: string;
  entries: RosterEntry[];
  // Mismo lenguaje visual que CapacityTally: relleno = confirmado,
  // contorno = en espera — el número de orden hace de "dorsal".
  tone: 'brand' | 'rope';
}

function RosterGroup({ title, entries, tone }: RosterGroupProps) {
  const badgeClass =
    tone === 'brand' ? 'bg-brand-600 text-white' : 'border border-rope text-rope';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
        {title} ({entries.length})
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-faint">Nadie por aquí todavía.</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <li key={entry.orden} className="flex items-center gap-2.5 text-sm text-ink">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClass}`}
              >
                {entry.orden}
              </span>
              {entry.display_name}
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
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-canvas-raised p-4">
      {isLoading && <p className="text-sm text-ink-faint">Cargando lista…</p>}

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se ha podido cargar la lista de la clase. Inténtalo de nuevo en unos
          segundos.
        </p>
      )}

      {roster && (
        <>
          <RosterGroup
            title="Dentro de la clase"
            entries={roster.filter((entry) => entry.estado === 'confirmada')}
            tone="brand"
          />
          <RosterGroup
            title="Lista de espera"
            entries={roster.filter((entry) => entry.estado === 'en_espera')}
            tone="rope"
          />
        </>
      )}
    </div>
  );
}
