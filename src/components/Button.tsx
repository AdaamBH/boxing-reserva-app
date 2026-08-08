import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

// Cuero oxblood (`brand`, ver src/styles/index.css) — evoca guante/lona de
// boxeo, deliberadamente distinto del rojo de validación (`danger`, ver
// TextField.tsx) para que un botón primario y un error nunca se confundan
// visualmente aunque compartan familia de color.
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/40',
  secondary:
    'border border-line-strong bg-canvas-raised text-ink hover:bg-chalk disabled:border-line disabled:text-ink-faint',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-150 ease-out focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 focus:ring-offset-canvas focus:outline-none active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_STYLES[variant]} ${className ?? ''}`}
      {...rest}
    >
      {isLoading ? 'Cargando…' : children}
    </button>
  );
}
