import { useState } from 'react';
import { useClassSessions } from '@/features/classes/hooks/useClassSessions';
import { useTrainers } from '@/features/trainers/hooks/useTrainers';
import { useCreateOneOffClassSession } from '@/features/admin/hooks/useCreateOneOffClassSession';
import { OneOffClassSessionForm } from '@/features/admin/components/OneOffClassSessionForm';
import { ClassSessionAdminRow } from '@/features/admin/components/ClassSessionAdminRow';
import { Button } from '@/components/Button';

export function AdminClassSessionsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: sessions, isLoading, error } = useClassSessions();
  const { data: trainers } = useTrainers();
  const { mutateAsync: createSession } = useCreateOneOffClassSession();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Sesiones de clase</h1>

      {!isCreating && (
        <Button type="button" onClick={() => setIsCreating(true)}>
          Nueva sesión suelta
        </Button>
      )}

      {isCreating && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <OneOffClassSessionForm
            trainers={trainers ?? []}
            onSubmit={async (values) => {
              await createSession(values);
              setIsCreating(false);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2"
            onClick={() => setIsCreating(false)}
          >
            Cancelar
          </Button>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">Cargando sesiones…</p>}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          No se han podido cargar las sesiones. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {sessions?.length === 0 && !isCreating && (
        <p className="text-sm text-slate-500">No hay sesiones programadas por ahora.</p>
      )}

      {sessions && sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <ClassSessionAdminRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
