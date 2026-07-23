import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema } from '@/features/auth/schemas';
import type { UpdatePasswordFormValues } from '@/features/auth/schemas';
import { updatePassword } from '@/features/auth/api/authApi';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

interface UpdatePasswordFormProps {
  onSuccess: () => void;
}

export function UpdatePasswordForm({ onSuccess }: UpdatePasswordFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({ resolver: zodResolver(updatePasswordSchema) });

  async function onSubmit(values: UpdatePasswordFormValues) {
    setSubmitError(null);
    try {
      await updatePassword(values.password);
      onSuccess();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TextField
        label="Contraseña nueva"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Confirma la contraseña nueva"
        type="password"
        autoComplete="new-password"
        error={errors.passwordConfirmation?.message}
        {...register('passwordConfirmation')}
      />

      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Guardar contraseña nueva
      </Button>
    </form>
  );
}
