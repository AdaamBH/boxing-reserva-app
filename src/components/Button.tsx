import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

// Rojo profundo y apagado (no el rojo vivo de los mensajes de error) —
// elección deliberada, no azul genérico de plantilla: evoca guante/lona de
// boxeo. Al ser un tono claramente distinto (más oscuro) del rojo de
// validación de TextField, un botón primario y un error nunca se confunden
// visualmente aunque compartan familia de color. Cuando exista marca real
// del gimnasio, este es el único sitio que hay que tocar.
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-rose-800 text-white hover:bg-rose-900 active:bg-rose-950 disabled:bg-rose-800/40',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400',
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
      className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-800 focus:ring-offset-2 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className ?? ''}`}
      {...rest}
    >
      {isLoading ? 'Cargando…' : children}
    </button>
  );
}
