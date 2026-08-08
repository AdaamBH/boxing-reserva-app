import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

// forwardRef es imprescindible aquí: React Hook Form necesita enganchar su
// propia ref al <input> real (`register('campo')` la aporta directamente),
// y sin forwardRef ese ref se perdería en el componente en vez de llegar
// al elemento nativo.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    // Necesita `id` o `name` para asociar la <label> con el campo
    // (accesibilidad). Con React Hook Form esto siempre está cubierto,
    // porque `register('campo')` aporta `name` automáticamente.
    const inputId = id ?? rest.name;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`min-h-11 rounded-lg border bg-chalk px-3 py-2 text-base text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-offset-1 focus:ring-offset-canvas focus:outline-none ${
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-line-strong focus:ring-brand-600'
          } ${className ?? ''}`}
          {...rest}
        />
        {error && (
          <p id={errorId} className="text-sm text-danger-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
