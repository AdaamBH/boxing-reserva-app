import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/features/auth/schemas';
import type { RegisterFormValues } from '@/features/auth/schemas';
import { signUp } from '@/features/auth/api/authApi';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';

interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null);
    try {
      await signUp(values);
      onSuccess(values.email);
    } catch (error) {
      // authApi.signUp ya traduce el error de Supabase a español
      // comprensible — aquí solo se muestra, no se reinterpreta.
      setSubmitError(
        error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    // noValidate: la validación nativa del navegador (por ejemplo, en
    // type="email") puede adelantarse a la de Zod y mostrar su propio
    // aviso antes de que React Hook Form llegue a evaluar nada. Con esto,
    // Zod es la única fuente de verdad de validación.
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <TextField
          label="Apellidos"
          error={errors.apellidos?.message}
          {...register('apellidos')}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        error={errors.telefono?.message}
        {...register('telefono')}
      />

      <TextField
        label="Fecha de nacimiento"
        type="date"
        error={errors.fechaNacimiento?.message}
        {...register('fechaNacimiento')}
      />

      <TextField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <TextField
        label="Confirma tu contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.passwordConfirmation?.message}
        {...register('passwordConfirmation')}
      />

      {submitError && (
        <p role="alert" className="text-sm text-danger-500">
          {submitError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
}
