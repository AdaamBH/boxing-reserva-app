import { describe, expect, it } from 'vitest';
import { getRemainingSpots, isSessionFull } from '@/utils/classSessions';

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
