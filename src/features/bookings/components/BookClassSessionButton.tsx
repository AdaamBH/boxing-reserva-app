import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDependents } from '@/features/dependents/hooks/useDependents';
import { useBookClassSession } from '@/features/bookings/hooks/useBookClassSession';

interface BookClassSessionButtonProps {
  sessionId: string;
  disabled?: boolean;
}

/**
 * Sin selector de "¿para quién?" — el dependiente por defecto (si el
 * usuario ha activado ese ajuste en Ajustes) se aplica solo. Reservar para
 * otra persona puntualmente significa apagar el ajuste primero, no elegir
 * en cada reserva (ver AI/DECISIONS.md).
 */
export function BookClassSessionButton({
  sessionId,
  disabled = false,
}: BookClassSessionButtonProps) {
  const [feedback, setFeedback] = useState<{ isError: boolean; text: string } | null>(
    null,
  );
  const { profile } = useAuth();
  const { data: dependents } = useDependents();
  const { mutateAsync, isPending } = useBookClassSession();

  const defaultDependentId = profile?.default_dependent_id ?? null;
  const defaultDependent = dependents?.find((d) => d.id === defaultDependentId);

  async function handleBook() {
    setFeedback(null);
    try {
      const result = await mutateAsync({ sessionId, dependentId: defaultDependentId });

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
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleBook}
        className="inline-flex min-h-11 w-fit items-center text-base font-semibold text-brand-600 transition-colors hover:text-brand-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:text-ink-faint disabled:active:scale-100"
      >
        {isPending ? 'Reservando…' : 'Reservar'}
      </button>

      {defaultDependent && !feedback && (
        <p className="text-xs text-ink-faint">Para {defaultDependent.nombre}</p>
      )}

      {feedback && (
        <p
          role="alert"
          className={`text-sm font-medium ${feedback.isError ? 'text-danger-500' : 'text-success-500'}`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
