import type { ClassSessionWithTrainer } from '@/features/classes/types';

interface ClassSessionCardProps {
  session: ClassSessionWithTrainer;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

// "T00:00:00" sin "Z" es a propósito: fuerza a JavaScript a interpretar
// la fecha en local, no en UTC (mismo motivo que en classesApi.ts) — así
// se muestra el día que de verdad corresponde en España.
function formatFecha(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatHora(hora: string): string {
  return hora.slice(0, 5);
}

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
        {formatFecha(session.fecha)} · {formatHora(session.hora_inicio)}–
        {formatHora(session.hora_fin)}
      </p>
      <p className="text-sm text-slate-600">Con {trainerName}</p>
      {/* Aforo total, no "plazas restantes" — eso depende de bookings,
          que no existe hasta Fase 3. */}
      <p className="text-sm text-slate-500">Aforo: {session.aforo_maximo} plazas</p>
    </div>
  );
}
