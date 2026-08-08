import { useState } from 'react';
import { formatSpanishDate, formatTime } from '@/utils/formatDate';
import { useLeaveWaitlist } from '@/features/bookings/hooks/useLeaveWaitlist';
import { Button } from '@/components/Button';
import type { WaitlistEntryWithSession } from '@/features/bookings/types';

interface WaitlistListItemProps {
  entry: WaitlistEntryWithSession;
}

export function WaitlistListItem({ entry }: WaitlistListItemProps) {
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useLeaveWaitlist();
  const { session } = entry;

  async function handleLeave() {
    setError(null);
    try {
      const result = await mutateAsync({ waitlistEntryId: entry.id });
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
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <p className="font-medium text-slate-900">{session.nombre}</p>
      <p className="text-sm text-slate-600">
        {formatSpanishDate(session.fecha)} · {formatTime(session.hora_inicio)}–
        {formatTime(session.hora_fin)}
      </p>
      <p className="text-sm text-slate-500">En lista de espera</p>
      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        onClick={handleLeave}
      >
        Salir de la lista de espera
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
