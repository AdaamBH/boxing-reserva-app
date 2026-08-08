import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingBeneficiarySchema } from '@/features/bookings/schemas';
import type { BookingBeneficiaryFormValues } from '@/features/bookings/schemas';
import { useBookClassSession } from '@/features/bookings/hooks/useBookClassSession';
import { useDependents } from '@/features/dependents/hooks/useDependents';
import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';

interface BookClassSessionButtonProps {
  sessionId: string;
  disabled?: boolean;
}

export function BookClassSessionButton({
  sessionId,
  disabled = false,
}: BookClassSessionButtonProps) {
  const [feedback, setFeedback] = useState<{ isError: boolean; text: string } | null>(
    null,
  );
  const { data: dependents } = useDependents();
  const { mutateAsync, isPending } = useBookClassSession();
  const { register, handleSubmit } = useForm<BookingBeneficiaryFormValues>({
    resolver: zodResolver(bookingBeneficiarySchema),
    defaultValues: { beneficiary: 'self' },
  });

  async function onSubmit(values: BookingBeneficiaryFormValues) {
    setFeedback(null);
    try {
      const result = await mutateAsync({
        sessionId,
        dependentId: values.beneficiary === 'self' ? null : values.beneficiary,
      });

      if (!result.success) {
        setFeedback({ isError: true, text: result.error.message });
        return;
      }

      setFeedback({
        isError: false,
        text:
          result.data === 'confirmada'
            ? 'Reserva confirmada.'
            : 'Clase llena: te hemos apuntado en la lista de espera.',
      });
    } catch (error) {
      setFeedback({
        isError: true,
        text:
          error instanceof Error ? error.message : 'Algo ha fallado. Inténtalo de nuevo.',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
      {dependents && dependents.length > 0 && (
        <SelectField
          label="¿Para quién es la reserva?"
          placeholder="Selecciona"
          options={[
            { value: 'self', label: 'Para mí' },
            ...dependents.map((dependent) => ({
              value: dependent.id,
              label: `${dependent.nombre} ${dependent.apellidos}`,
            })),
          ]}
          {...register('beneficiary')}
        />
      )}

      <Button type="submit" isLoading={isPending} disabled={disabled}>
        Reservar
      </Button>

      {feedback && (
        <p
          role="alert"
          className={`text-sm font-medium ${feedback.isError ? 'text-danger-500' : 'text-success-500'}`}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}
