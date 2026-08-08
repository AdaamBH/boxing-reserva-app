import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classTemplateSchema, NIVELES } from '@/features/admin/schemas';
import type {
  ClassTemplateFormInput,
  ClassTemplateFormValues,
} from '@/features/admin/schemas';
import type { Trainer } from '@/features/trainers/types';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SelectField } from '@/components/SelectField';

interface ClassTemplateFormProps {
  trainers: Trainer[];
  initialValues?: ClassTemplateFormValues;
  submitLabel: string;
  onSubmit: (values: ClassTemplateFormValues) => Promise<void>;
}

const DIA_OPTIONS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
].map((label, value) => ({ value: String(value), label }));

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const NIVEL_OPTIONS = NIVELES.map((nivel) => ({
  value: nivel,
  label: NIVEL_LABEL[nivel] ?? nivel,
}));

export function ClassTemplateForm({
  trainers,
  initialValues,
  submitLabel,
  onSubmit,
}: ClassTemplateFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassTemplateFormInput, unknown, ClassTemplateFormValues>({
    resolver: zodResolver(classTemplateSchema),
    // Spread condicional, no `defaultValues: initialValues` directo:
    // con `exactOptionalPropertyTypes`, asignar explícitamente `undefined`
    // a una propiedad opcional no es lo mismo que omitirla — solo se
    // incluye la clave cuando de verdad hay valores iniciales (modo edición).
    ...(initialValues ? { defaultValues: initialValues } : {}),
  });

  async function handleFormSubmit(values: ClassTemplateFormValues) {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  const trainerOptions = trainers.map((trainer) => ({
    value: trainer.id,
    label: trainer.nombre,
  }));

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <TextField label="Nombre" error={errors.nombre?.message} {...register('nombre')} />

      <SelectField
        label="Día de la semana"
        placeholder="Selecciona un día"
        options={DIA_OPTIONS}
        error={errors.diaSemana?.message}
        {...register('diaSemana')}
      />

      <div className="flex gap-3">
        <TextField
          label="Hora inicio"
          type="time"
          error={errors.horaInicio?.message}
          {...register('horaInicio')}
        />
        <TextField
          label="Hora fin"
          type="time"
          error={errors.horaFin?.message}
          {...register('horaFin')}
        />
      </div>

      <SelectField
        label="Nivel"
        placeholder="Selecciona un nivel"
        options={NIVEL_OPTIONS}
        error={errors.nivel?.message}
        {...register('nivel')}
      />

      <SelectField
        label="Entrenador"
        placeholder="Selecciona un entrenador"
        options={trainerOptions}
        error={errors.trainerId?.message}
        {...register('trainerId')}
      />

      <TextField
        label="Aforo máximo"
        type="number"
        min={1}
        error={errors.aforoMaximo?.message}
        {...register('aforoMaximo')}
      />

      {submitError && (
        <p role="alert" className="text-sm text-danger-500">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
