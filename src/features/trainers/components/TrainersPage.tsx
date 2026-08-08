import { useTrainers } from '@/features/trainers/hooks/useTrainers';
import { TrainerCard } from '@/features/trainers/components/TrainerCard';

export function TrainersPage() {
  const { data: trainers, isLoading, error } = useTrainers();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Entrenadores</h1>

      {isLoading && <p className="text-sm text-ink-faint">Cargando entrenadores…</p>}

      {error && (
        <p role="alert" className="text-sm text-danger-500">
          No se han podido cargar los entrenadores. Inténtalo de nuevo en unos segundos.
        </p>
      )}

      {trainers && trainers.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
