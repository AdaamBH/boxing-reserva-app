import type { Trainer } from '@/features/trainers/types';

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas-raised p-4">
      {trainer.foto_url && (
        <img
          src={trainer.foto_url}
          alt={trainer.nombre}
          className="h-32 w-32 self-center rounded-full object-cover"
        />
      )}
      <h3 className="text-center text-base font-semibold text-ink">{trainer.nombre}</h3>
      {trainer.especialidad && (
        <p className="text-center text-sm text-ink-muted">{trainer.especialidad}</p>
      )}
      {trainer.bio && <p className="text-sm text-ink-muted">{trainer.bio}</p>}
    </div>
  );
}
