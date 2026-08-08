import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { oneOffClassSessionSchema, NIVELES } from '@/features/admin/schemas';
import type {
  OneOffClassSessionFormInput,
  OneOffClassSessionFormValues,
} from '@/features/admin/schemas';
import type { Trainer } from '@/features/trainers/types';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SelectField } from '@/components/SelectField';

interface OneOffClassSessionFormProps {
  trainers: Trainer[];
  onSubmit: (values: OneOffClassSessionFormValues) => Promise<void>;
}

const NIVEL_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

const NIVEL_OPTIONS = NIVELES.map((nivel) => ({
  value: nivel,
  label: NIVEL_LABEL[nivel] ?? nivel,
}));

export function OneOffClassSessionForm({
  trainers,
  onSubmit,
}: OneOffClassSessionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OneOffClassSessionFormInput, unknown, OneOffClassSessionFormValues>({
    resolver: zodResolver(oneOffClassSessionSchema),
  });

  async function handleFormSubmit(values: OneOffClassSessionFormValues) {
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
      <TextField
        label="Fecha"
        type="date"
        error={errors.fecha?.message}
        {...register('fecha')}
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
        Crear sesión
      </Button>
    </form>
  );
}
