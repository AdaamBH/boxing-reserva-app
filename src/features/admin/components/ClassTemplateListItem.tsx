import { useState } from 'react';
import type { Trainer } from '@/features/trainers/types';
import type { ClassTemplate } from '@/features/admin/types';
import type { ClassTemplateFormValues } from '@/features/admin/schemas';
import { ClassTemplateForm } from '@/features/admin/components/ClassTemplateForm';
import { useUpdateClassTemplate } from '@/features/admin/hooks/useUpdateClassTemplate';
import { useToggleClassTemplateActive } from '@/features/admin/hooks/useToggleClassTemplateActive';
import { Button } from '@/components/Button';
import { formatTime } from '@/utils/formatDate';

interface ClassTemplateListItemProps {
  template: ClassTemplate;
  trainers: Trainer[];
}

const DIA_LABEL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function ClassTemplateListItem({
  template,
  trainers,
}: ClassTemplateListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateTemplate } = useUpdateClassTemplate(template.id);
  const { mutate: toggleActive, isPending: isToggling } = useToggleClassTemplateActive();

  if (isEditing) {
    const initialValues: ClassTemplateFormValues = {
      nombre: template.nombre,
      diaSemana: template.dia_semana,
      horaInicio: template.hora_inicio,
      horaFin: template.hora_fin,
      nivel: template.nivel as ClassTemplateFormValues['nivel'],
      trainerId: template.trainer_id,
      aforoMaximo: template.aforo_maximo,
    };

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas-raised p-4">
        <ClassTemplateForm
          trainers={trainers}
          initialValues={initialValues}
          submitLabel="Guardar cambios"
          onSubmit={async (values) => {
            await updateTemplate(values);
            setIsEditing(false);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => setIsEditing(false)}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  const trainerName = trainers.find(
    (trainer) => trainer.id === template.trainer_id,
  )?.nombre;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas-raised p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{template.nombre}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            template.activo
              ? 'bg-success-500/15 text-success-500'
              : 'bg-chalk text-ink-faint'
          }`}
        >
          {template.activo ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      <p className="text-sm text-ink-muted">
        {DIA_LABEL[template.dia_semana]} · {formatTime(template.hora_inicio)}–
        {formatTime(template.hora_fin)}
      </p>
      <p className="text-sm text-ink-muted">
        {NIVEL_LABEL[template.nivel] ?? template.nivel} · Con{' '}
        {trainerName ?? 'entrenador por asignar'}
      </p>
      <p className="text-sm text-ink-faint">Aforo: {template.aforo_maximo} plazas</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => setIsEditing(true)}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          isLoading={isToggling}
          onClick={() => toggleActive({ id: template.id, activo: !template.activo })}
        >
          {template.activo ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
    </div>
  );
}
