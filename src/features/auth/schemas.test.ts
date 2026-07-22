import { describe, expect, it } from 'vitest';
import { registerSchema } from './schemas';

// Formatea en fecha local (no UTC) — a propósito. `toISOString()` convierte
// a UTC, y en la zona horaria de España eso puede desplazar la fecha un día
// justo alrededor de la medianoche, dando un test inestable cerca del
// límite de edad que es exactamente lo que queremos probar con precisión.
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const validData = {
  email: 'ana@example.com',
  password: 'password123',
  passwordConfirmation: 'password123',
  nombre: 'Ana',
  apellidos: 'García López',
  telefono: '600123456',
  fechaNacimiento: '1990-05-15',
};

describe('registerSchema', () => {
  it('acepta datos válidos de un adulto', () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it('acepta a alguien que cumple exactamente 18 años hoy', () => {
    const today = new Date();
    const exactlyEighteen = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );

    const result = registerSchema.safeParse({
      ...validData,
      fechaNacimiento: toDateString(exactlyEighteen),
    });

    expect(result.success).toBe(true);
  });

  it('rechaza a quien cumple 18 años mañana (hoy todavía tiene 17)', () => {
    const today = new Date();
    const eighteenTomorrow = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() + 1,
    );

    const result = registerSchema.safeParse({
      ...validData,
      fechaNacimiento: toDateString(eighteenTomorrow),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fechaError = result.error.issues.find((issue) =>
        issue.path.includes('fechaNacimiento'),
      );
      expect(fechaError?.message).toContain('mayor de edad');
    }
  });

  it('rechaza si las contraseñas no coinciden', () => {
    const result = registerSchema.safeParse({
      ...validData,
      passwordConfirmation: 'otraContraseña',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.includes('passwordConfirmation')),
      ).toBe(true);
    }
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'corta1',
      passwordConfirmation: 'corta1',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza un email con formato inválido', () => {
    expect(
      registerSchema.safeParse({ ...validData, email: 'no-es-un-email' }).success,
    ).toBe(false);
  });

  it('rechaza un teléfono con menos de 9 dígitos', () => {
    expect(registerSchema.safeParse({ ...validData, telefono: '12345' }).success).toBe(
      false,
    );
  });
});
