import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';

interface ClassSessionCardProps {
  session: ClassSessionWithTrainer;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function ClassSessionCard({ session }: ClassSessionCardProps) {
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';

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
      {/* Aforo total, no "plazas restantes" — eso depende de bookings,
          que no existe hasta Fase 3. */}
      <p className="text-sm text-slate-500">Aforo: {session.aforo_maximo} plazas</p>
    </div>
  );
}
