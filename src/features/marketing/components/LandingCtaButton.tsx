import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LandingCtaVariant = 'primary' | 'secondary';
type LandingCtaSize = 'sm' | 'lg';

interface LandingCtaButtonProps {
  to: string;
  children: ReactNode;
  variant?: LandingCtaVariant;
  size?: LandingCtaSize;
  className?: string;
}

const VARIANT_STYLES: Record<LandingCtaVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-line-strong bg-canvas-raised text-ink hover:bg-chalk',
};

const SIZE_STYLES: Record<LandingCtaSize, string> = {
  sm: 'min-h-10 px-4 text-sm',
  lg: 'min-h-12 px-8 text-base',
};

/**
 * Los tres CTA de la landing (header, hero, sección final) compartían
 * exactamente las mismas clases copiadas tres veces — segunda reutilización
 * real, así que se extrae aquí en vez de seguir copiando la cadena.
 */
export function LandingCtaButton({
  to,
  children,
  variant = 'primary',
  size = 'lg',
  className,
}: LandingCtaButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none active:scale-[0.97] ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className ?? ''}`}
    >
      {children}
    </Link>
  );
}
