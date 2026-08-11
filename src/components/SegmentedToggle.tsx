interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedToggleOption<T>[];
}

/** Alterna entre 2-3 vistas de una misma página (ej. Semana/Mes, Próximas/Historial). */
export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: SegmentedToggleProps<T>) {
  return (
    <div className="flex rounded-lg border border-line p-0.5 text-sm font-medium">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            value === option.value
              ? 'bg-brand-600 text-white'
              : 'text-ink-muted hover:bg-chalk'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
