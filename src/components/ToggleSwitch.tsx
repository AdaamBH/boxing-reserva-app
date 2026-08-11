interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

// <label> envuelve todo (texto + pista) para que el área táctil sea la fila
// entera, no solo la pista de 44x24 — ver "hit areas" en la guía de diseño.
export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 has-disabled:cursor-not-allowed">
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span className="h-6 w-11 rounded-full border border-line-strong bg-chalk transition-colors peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-canvas-raised shadow-sm transition-transform duration-150 ease-out peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
