import { useState } from 'react';
import { useLeaveWaitlist } from '@/features/bookings/hooks/useLeaveWaitlist';
import { Button } from '@/components/Button';

interface WaitlistedActionsProps {
  waitlistEntryId: string;
}

/** Acciones para una sesión donde el usuario está en lista de espera. */
export function WaitlistedActions({ waitlistEntryId }: WaitlistedActionsProps) {
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useLeaveWaitlist();

  async function handleLeave() {
    setError(null);
    try {
      const result = await mutateAsync({ waitlistEntryId });
      if (!result.success) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Algo ha fallado. Inténtalo de nuevo.',
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-rope">En lista de espera</p>

      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        onClick={handleLeave}
      >
        Salir de la lista de espera
      </Button>

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
