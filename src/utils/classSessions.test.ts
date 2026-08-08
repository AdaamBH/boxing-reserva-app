import { describe, expect, it } from 'vitest';
import {
  canCancelBooking,
  getRemainingSpots,
  isSessionFull,
  isSessionPast,
} from '@/utils/classSessions';

describe('getRemainingSpots', () => {
  it('calcula las plazas libres cuando quedan huecos', () => {
    expect(getRemainingSpots(20, 15)).toBe(5);
  });

  it('devuelve 0 cuando la sesión está exactamente llena', () => {
    expect(getRemainingSpots(20, 20)).toBe(0);
  });

  it('nunca devuelve un número negativo, aunque haya sobrerreserva', () => {
    expect(getRemainingSpots(20, 22)).toBe(0);
  });
});

describe('isSessionFull', () => {
  it('es true cuando no quedan plazas', () => {
    expect(isSessionFull(20, 20)).toBe(true);
  });

  it('es false cuando quedan plazas', () => {
    expect(isSessionFull(20, 19)).toBe(false);
  });
});

describe('isSessionPast', () => {
  const now = new Date('2026-07-20T18:00:00');

  it('es true cuando la sesión ya ha empezado', () => {
    expect(isSessionPast('2026-07-20', '17:00', now)).toBe(true);
  });

  it('es true justo en el instante de inicio (límite inclusivo)', () => {
    expect(isSessionPast('2026-07-20', '18:00', now)).toBe(true);
  });

  it('es false cuando la sesión todavía no ha empezado', () => {
    expect(isSessionPast('2026-07-20', '19:00', now)).toBe(false);
  });
});

describe('canCancelBooking', () => {
  const now = new Date('2026-07-20T18:00:00');

  it('es true cuando faltan más de 1 hora para la clase', () => {
    expect(canCancelBooking('2026-07-20', '19:30', now)).toBe(true);
  });

  it('es false cuando falta 1 hora exacta (límite no inclusivo)', () => {
    expect(canCancelBooking('2026-07-20', '19:00', now)).toBe(false);
  });

  it('es false cuando falta menos de 1 hora', () => {
    expect(canCancelBooking('2026-07-20', '18:30', now)).toBe(false);
  });

  it('es false cuando la clase ya ha empezado', () => {
    expect(canCancelBooking('2026-07-20', '17:00', now)).toBe(false);
  });
});
