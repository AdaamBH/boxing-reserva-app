import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { useCancelClassSession } from '@/features/admin/hooks/useCancelClassSession';
import { Button } from '@/components/Button';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';

interface ClassSessionAdminRowProps {
  session: ClassSessionWithTrainer;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function ClassSessionAdminRow({ session }: ClassSessionAdminRowProps) {
  const { mutate: cancelSession, isPending } = useCancelClassSession();
  const trainerName = session.trainer?.nombre ?? 'entrenador por asignar';

  function handleCancel() {
    // Confirmación nativa a propósito: cancelar una sesión concreta es
    // irreversible desde aquí (versión sencilla, sin deshacer) y afecta a
    // quien ya tuviera plaza — mejor un paso extra que un clic accidental.
    if (
      window.confirm(
        `¿Cancelar "${session.nombre}" del ${formatSpanishDate(session.fecha)}?`,
      )
    ) {
      cancelSession(session.id);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">{session.nombre}</h3>
      <p className="text-sm text-slate-600">
        {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
        {formatTime(session.hora_fin)}
      </p>
      <p className="text-sm text-slate-600">
        {NIVEL_LABEL[session.nivel] ?? session.nivel} · Con {trainerName}
      </p>
      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        onClick={handleCancel}
      >
        Cancelar sesión
      </Button>
    </div>
  );
}
