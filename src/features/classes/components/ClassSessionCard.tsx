import { Link } from 'react-router-dom';
import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';
import { getRemainingSpots, isSessionFull, isSessionPast } from '@/utils/classSessions';
import { BookClassSessionButton } from '@/features/bookings/components/BookClassSessionButton';
import { CapacityTally } from '@/features/bookings/components/CapacityTally';

interface ClassSessionCardProps {
  session: ClassSessionWithTrainer;
  ocupadas: number;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function ClassSessionCard({ session, ocupadas }: ClassSessionCardProps) {
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';
  const remainingSpots = getRemainingSpots(session.aforo_maximo, ocupadas);
  const full = isSessionFull(session.aforo_maximo, ocupadas);
  const past = isSessionPast(session.fecha, session.hora_inicio);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas-raised p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg leading-tight font-semibold text-ink">{session.nombre}</h3>
        <span className="shrink-0 rounded-full bg-rope-soft px-2.5 py-1 text-xs font-medium text-ink-muted">
          {NIVEL_LABEL[session.nivel] ?? session.nivel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-ink-muted">
          {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
          {formatTime(session.hora_fin)}
        </p>
        <p className="text-sm text-ink-muted">Con {trainerName}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm font-medium ${full ? 'text-brand-600' : 'text-ink-muted'}`}
        >
          {full ? 'Clase llena' : `${remainingSpots} plazas libres`}
        </p>
        <CapacityTally aforoMaximo={session.aforo_maximo} ocupadas={ocupadas} />
      </div>

      <Link
        to={`/clases/${session.id}/lista`}
        className="self-start text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
      >
        Ver lista de la clase
      </Link>

      {!past && <BookClassSessionButton sessionId={session.id} />}
    </div>
  );
}
