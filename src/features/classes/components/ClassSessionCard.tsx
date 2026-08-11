import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { formatTime } from '@/utils/formatDate';
import { isSessionPast } from '@/utils/classSessions';
import { getClassTypeColorClass } from '@/utils/classTypeColor';
import { ClassSessionActions } from '@/features/bookings/components/ClassSessionActions';
import { ClockIcon, UserIcon } from '@/components/icons';
import type { SessionBookingStatus } from '@/features/bookings/types';

interface ClassSessionCardProps {
  session: ClassSessionWithTrainer;
  status?: SessionBookingStatus | undefined;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

/**
 * Dos líneas en vez de tres (horario+tipo, entrenador+nivel) para que quepan
 * más clases sin desplazarse — el aforo/CapacityTally que tenía antes se ha
 * quitado a propósito por el mismo motivo; sigue disponible en la lista de
 * apuntados ("Ver Clase"). El tipo de clase se distingue por color
 * (getClassTypeColorClass) en vez de por una fila icono+texto propia.
 */
export function ClassSessionCard({ session, status }: ClassSessionCardProps) {
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';
  const past = isSessionPast(session.fecha, session.hora_inicio);
  const tagColorClass = getClassTypeColorClass(session.nombre);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-canvas-raised p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <ClockIcon className="h-4 w-4 shrink-0 text-ink-faint" />
          <span>
            {formatTime(session.hora_inicio)}–{formatTime(session.hora_fin)}
          </span>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-inset ring-black/5 ${tagColorClass}`}
        >
          {session.nombre}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <UserIcon className="h-4 w-4 shrink-0 text-ink-faint" />
        <span>{trainerName}</span>
        <span className="text-ink-faint">
          · {NIVEL_LABEL[session.nivel] ?? session.nivel}
        </span>
      </div>

      <ClassSessionActions
        sessionId={session.id}
        fecha={session.fecha}
        horaInicio={session.hora_inicio}
        status={status}
        past={past}
      />
    </div>
  );
}
