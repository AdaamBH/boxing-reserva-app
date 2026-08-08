import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  options: SelectFieldOption[];
  placeholder: string;
}

// Mismo motivo que TextField: forwardRef para que React Hook Form pueda
// enganchar su propia ref (`register('campo')`) al <select> real.
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, placeholder, id, className, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-muted">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`min-h-11 rounded-lg border bg-chalk px-3 py-2 text-base text-ink focus:ring-2 focus:ring-offset-1 focus:ring-offset-canvas focus:outline-none ${
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-line-strong focus:ring-brand-600'
          } ${className ?? ''}`}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-sm text-danger-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

SelectField.displayName = 'SelectField';
