import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordResetRequestSchema } from '@/features/auth/schemas';
import type { PasswordResetRequestFormValues } from '@/features/auth/schemas';
import { requestPasswordReset } from '@/features/auth/api/authApi';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

interface PasswordResetRequestFormProps {
  onSuccess: (email: string) => void;
}

export function PasswordResetRequestForm({ onSuccess }: PasswordResetRequestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  async function onSubmit(values: PasswordResetRequestFormValues) {
    setSubmitError(null);
    try {
      await requestPasswordReset(values.email);
      onSuccess(values.email);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      {submitError && (
        <p role="alert" className="text-sm text-danger-500">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Enviar enlace de recuperación
      </Button>
    </form>
  );
}
