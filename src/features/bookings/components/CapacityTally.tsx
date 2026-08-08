interface CapacityTallyProps {
  aforoMaximo: number;
  ocupadas: number;
}

// Marcador de aforo estilo tarjeta de asalto: un círculo relleno por
// plaza ocupada, en contorno por plaza libre — el aforo se lee de un
// vistazo, sin hacer la resta mentalmente. `aria-hidden` a propósito:
// siempre va acompañado del texto "N plazas libres"/"Clase llena", que ya
// transmite la misma información de forma accesible.
export function CapacityTally({ aforoMaximo, ocupadas }: CapacityTallyProps) {
  const taken = Math.min(ocupadas, aforoMaximo);

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: aforoMaximo }, (_, index) => (
        <span
          key={index}
          className={
            index < taken
              ? 'h-2.5 w-2.5 rounded-full bg-brand-600'
              : 'h-2.5 w-2.5 rounded-full border border-line-strong'
          }
        />
      ))}
    </div>
  );
}
