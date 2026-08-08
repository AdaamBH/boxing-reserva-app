import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

// Solo transform/opacity (compuesto por GPU, ver AI/CODE_STYLE.md si se
// añade una regla de animación — nunca width/height/margin).
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`duration-500 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } transition-[opacity,transform] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
