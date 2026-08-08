import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDependentSchema } from '@/features/dependents/schemas';
import type { AddDependentFormValues } from '@/features/dependents/schemas';
import { useAddDependent } from '@/features/dependents/hooks/useAddDependent';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SelectField } from '@/components/SelectField';

interface AddDependentFormProps {
  onSuccess: () => void;
}

const OPCIONES_RELACION = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'tutor_legal', label: 'Tutor/a legal' },
] as const;

export function AddDependentForm({ onSuccess }: AddDependentFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useAddDependent();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddDependentFormValues>({ resolver: zodResolver(addDependentSchema) });

  async function onSubmit(values: AddDependentFormValues) {
    setSubmitError(null);
    try {
      await mutateAsync(values);
      onSuccess();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TextField label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
      <TextField
        label="Apellidos"
        error={errors.apellidos?.message}
        {...register('apellidos')}
      />
      <TextField
        label="Fecha de nacimiento"
        type="date"
        error={errors.fechaNacimiento?.message}
        {...register('fechaNacimiento')}
      />

      <SelectField
        label="Tu relación con el/la menor"
        placeholder="Selecciona una opción"
        options={OPCIONES_RELACION.map((opcion) => ({ ...opcion }))}
        error={errors.relacion?.message}
        {...register('relacion')}
      />

      {/* Consentimiento explícito y visible — no un checkbox genérico de
          "acepto términos" (SECURITY.md). Nombra el dato y la finalidad
          concretos. */}
      <label className="flex items-start gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line-strong"
          {...register('consentimiento')}
        />
        <span>
          Confirmo que soy el padre/madre o tutor/a legal de este menor, y consiento el
          tratamiento de sus datos (nombre, apellidos y fecha de nacimiento) con la única
          finalidad de gestionar sus reservas de clases en el gimnasio.
        </span>
      </label>
      {errors.consentimiento && (
        <p className="text-sm text-danger-500">{errors.consentimiento.message}</p>
      )}

      {submitError && (
        <p role="alert" className="text-sm text-danger-500">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isPending}>
        Añadir dependiente
      </Button>
    </form>
  );
}
