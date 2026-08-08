import { useState } from 'react';
import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';
import { getRemainingSpots, isSessionFull, isSessionPast } from '@/utils/classSessions';
import { BookClassSessionButton } from '@/features/bookings/components/BookClassSessionButton';
import { SessionRosterList } from '@/features/bookings/components/SessionRosterList';

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
  const [showRoster, setShowRoster] = useState(false);
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';
  const remainingSpots = getRemainingSpots(session.aforo_maximo, ocupadas);
  const full = isSessionFull(session.aforo_maximo, ocupadas);
  const past = isSessionPast(session.fecha, session.hora_inicio);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{session.nombre}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {NIVEL_LABEL[session.nivel] ?? session.nivel}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
        {formatTime(session.hora_fin)}
      </p>
      <p className="text-sm text-slate-600">Con {trainerName}</p>
      <p className="text-sm text-slate-500">
        {full ? 'Clase llena' : `${remainingSpots} plazas libres`}
      </p>

      <button
        type="button"
        onClick={() => setShowRoster((prev) => !prev)}
        className="self-start text-sm font-medium text-rose-800 underline-offset-2 hover:underline"
      >
        {showRoster ? 'Ocultar lista de la clase' : 'Ver lista de la clase'}
      </button>
      {showRoster && <SessionRosterList sessionId={session.id} />}

      {!past && <BookClassSessionButton sessionId={session.id} />}
    </div>
  );
}
