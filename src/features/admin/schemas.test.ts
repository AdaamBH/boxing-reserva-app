import { describe, expect, it } from 'vitest';
import { classTemplateSchema, oneOffClassSessionSchema } from './schemas';

const validTemplate = {
  nombre: 'Boxeo iniciación',
  diaSemana: '1',
  horaInicio: '18:00',
  horaFin: '19:00',
  nivel: 'principiante',
  trainerId: 'trainer-1',
  aforoMaximo: '20',
};

describe('classTemplateSchema', () => {
  it('acepta datos válidos', () => {
    const result = classTemplateSchema.safeParse(validTemplate);
    expect(result.success).toBe(true);
    if (result.success) {
      // z.coerce.number() convierte los strings del formulario a number.
      expect(result.data.diaSemana).toBe(1);
      expect(result.data.aforoMaximo).toBe(20);
    }
  });

  it('rechaza si la hora de fin no es posterior a la de inicio', () => {
    const result = classTemplateSchema.safeParse({
      ...validTemplate,
      horaInicio: '19:00',
      horaFin: '18:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('horaFin'))).toBe(
        true,
      );
    }
  });

  it('rechaza un aforo máximo de 0 o negativo', () => {
    expect(
      classTemplateSchema.safeParse({ ...validTemplate, aforoMaximo: '0' }).success,
    ).toBe(false);
  });

  it('rechaza un día de la semana fuera de rango (0-6)', () => {
    expect(
      classTemplateSchema.safeParse({ ...validTemplate, diaSemana: '7' }).success,
    ).toBe(false);
  });
});

describe('oneOffClassSessionSchema', () => {
  const validSession = {
    nombre: 'Clase especial',
    fecha: '2026-08-15',
    horaInicio: '10:00',
    horaFin: '11:00',
    nivel: 'avanzado',
    trainerId: 'trainer-1',
    aforoMaximo: '15',
  };

  it('acepta datos válidos', () => {
    expect(oneOffClassSessionSchema.safeParse(validSession).success).toBe(true);
  });

  it('rechaza si la hora de fin no es posterior a la de inicio', () => {
    const result = oneOffClassSessionSchema.safeParse({
      ...validSession,
      horaInicio: '11:00',
      horaFin: '11:00',
    });
    expect(result.success).toBe(false);
  });
});
