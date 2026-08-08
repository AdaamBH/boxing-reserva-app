import type { Trainer } from '@/features/trainers/types';

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  const initial = trainer.nombre.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-canvas-raised p-4 text-center shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
      {trainer.foto_url ? (
        <img
          src={trainer.foto_url}
          alt={trainer.nombre}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-display flex h-24 w-24 items-center justify-center rounded-full bg-brand-600/10 text-3xl text-brand-600"
        >
          {initial}
        </span>
      )}
      <h3 className="text-base font-semibold text-ink">{trainer.nombre}</h3>
      {trainer.especialidad && (
        <p className="text-sm text-ink-muted">{trainer.especialidad}</p>
      )}
      {trainer.bio && <p className="text-left text-sm text-ink-muted">{trainer.bio}</p>}
    </div>
  );
}
