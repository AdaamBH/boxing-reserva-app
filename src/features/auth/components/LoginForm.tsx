import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/schemas';
import type { LoginFormValues } from '@/features/auth/schemas';
import { signIn } from '@/features/auth/api/authApi';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    try {
      await signIn(values.email, values.password);
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
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      {submitError && (
        <p role="alert" className="text-sm text-danger-500">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Iniciar sesión
      </Button>
    </form>
  );
}
