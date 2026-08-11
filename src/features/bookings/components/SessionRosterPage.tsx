import { Link, useParams } from 'react-router-dom';
import { useClassSession } from '@/features/classes/hooks/useClassSession';
import { SessionRosterList } from '@/features/bookings/components/SessionRosterList';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';

export function SessionRosterPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: session, isLoading, error } = useClassSession(sessionId ?? '');

  if (!sessionId) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <Link to="/reservas" className="text-sm font-medium text-brand-600 hover:underline">
        ← Volver a reservas
      </Link>

      {isLoading && <p className="text-sm text-ink-faint">Cargando…</p>}
      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se ha podido cargar la clase. Inténtalo de nuevo en unos segundos.
        </p>
      )}
      {session && (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">
            {session.nombre}
          </h1>
          <p className="text-sm text-ink-muted">
            {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
            {formatTime(session.hora_fin)}
          </p>
        </div>
      )}

      <SessionRosterList sessionId={sessionId} />
    </div>
  );
}
