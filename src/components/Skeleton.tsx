interface SkeletonProps {
  className?: string;
}

/**
 * Bloque de carga con pulso (`bg-chalk`, la misma superficie hundida que
 * inputs/selects) — sustituye a un simple "Cargando…" en listas para que la
 * forma de las tarjetas reales ya esté presente antes de que lleguen los
 * datos: menos salto de layout, sensación más fluida.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-chalk ${className ?? ''}`}
    />
  );
}
