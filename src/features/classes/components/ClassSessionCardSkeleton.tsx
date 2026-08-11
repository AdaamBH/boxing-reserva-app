import { Skeleton } from '@/components/Skeleton';

/** Misma silueta que ClassSessionCard (2 filas + acción) para que la lista no salte al llegar los datos. */
export function ClassSessionCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-canvas-raised p-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
