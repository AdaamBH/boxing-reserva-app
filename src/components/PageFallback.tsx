interface PageFallbackProps {
  // 'min-h-dvh' para una espera a pantalla completa (auth, carga inicial);
  // algo más bajo cuando ya hay cabecera/nav alrededor (dentro de
  // AppShell) para no forzar una altura mayor que el propio viewport.
  minHeightClassName?: string;
}

export function PageFallback({ minHeightClassName = 'min-h-dvh' }: PageFallbackProps) {
  return (
    <div className={`flex items-center justify-center ${minHeightClassName}`}>
      <p className="text-sm text-ink-faint">Cargando…</p>
    </div>
  );
}
