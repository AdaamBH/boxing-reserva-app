import { describe, expect, it } from 'vitest';
import { getClassTypeColorClass } from '@/utils/classTypeColor';

describe('getClassTypeColorClass', () => {
  it('devuelve siempre el mismo color para el mismo nombre de clase', () => {
    const first = getClassTypeColorClass('Boxeo técnico');
    const second = getClassTypeColorClass('Boxeo técnico');
    expect(first).toBe(second);
  });

  it('devuelve colores distintos para nombres de clase distintos', () => {
    expect(getClassTypeColorClass('Boxeo técnico')).not.toBe(
      getClassTypeColorClass('Cardio Box'),
    );
  });

  it('devuelve una clase Tailwind bg-tag-*', () => {
    expect(getClassTypeColorClass('Cardio Box')).toMatch(/^bg-tag-/);
  });
});
