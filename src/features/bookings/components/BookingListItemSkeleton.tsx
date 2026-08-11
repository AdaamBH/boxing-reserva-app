import { Skeleton } from '@/components/Skeleton';

/** Misma silueta que BookingListItem/WaitlistListItem/BookingHistoryItem
 * (título + 2 líneas de meta + acción opcional) para que Mis reservas no
 * salte al llegar los datos. */
export function BookingListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-canvas-raised p-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-1 h-11 w-full" />
    </div>
  );
}
