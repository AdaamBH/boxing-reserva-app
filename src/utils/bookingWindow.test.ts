import { describe, expect, it } from 'vitest';
import {
  BOOKABLE_WEEKS_AHEAD,
  getLastBookableDate,
  getLastBookableWeekStart,
  isWithinBookingWindow,
} from '@/utils/bookingWindow';
import { toDateString } from '@/utils/calendarDates';

// Semana del lunes 2026-08-10 al domingo 2026-08-16. Con el tope en una
// semana, el último día reservable es el domingo 2026-08-23.
const MONDAY = new Date(2026, 7, 10);
const FRIDAY = new Date(2026, 7, 14);
const SUNDAY = new Date(2026, 7, 16);

describe('bookingWindow', () => {
  it('abre exactamente una semana más allá de la actual', () => {
    expect(BOOKABLE_WEEKS_AHEAD).toBe(1);
  });

  describe('getLastBookableWeekStart', () => {
    it('devuelve el lunes de la semana siguiente', () => {
      expect(toDateString(getLastBookableWeekStart(FRIDAY))).toBe('2026-08-17');
    });

    // El tope depende de la SEMANA, no del día suelto: da igual que se
    // consulte el lunes o el domingo, la ventana es la misma para todos.
    it('no se mueve según el día de la semana en que se consulte', () => {
      const desdeLunes = toDateString(getLastBookableWeekStart(MONDAY));
      const desdeDomingo = toDateString(getLastBookableWeekStart(SUNDAY));
      expect(desdeLunes).toBe(desdeDomingo);
    });
  });

  describe('getLastBookableDate', () => {
    it('devuelve el domingo de la semana siguiente', () => {
      expect(toDateString(getLastBookableDate(FRIDAY))).toBe('2026-08-23');
    });
  });

  describe('isWithinBookingWindow', () => {
    it('acepta un día de la semana en curso', () => {
      expect(isWithinBookingWindow(new Date(2026, 7, 15), FRIDAY)).toBe(true);
    });

    it('acepta un día de la semana siguiente', () => {
      expect(isWithinBookingWindow(new Date(2026, 7, 19), FRIDAY)).toBe(true);
    });

    it('acepta el último día del tope (domingo), sin dejarlo fuera por un día', () => {
      expect(isWithinBookingWindow(new Date(2026, 7, 23), FRIDAY)).toBe(true);
    });

    it('rechaza el día siguiente al tope', () => {
      expect(isWithinBookingWindow(new Date(2026, 7, 24), FRIDAY)).toBe(false);
    });

    it('rechaza una clase de dentro de un mes, aunque pg_cron ya la haya generado', () => {
      expect(isWithinBookingWindow(new Date(2026, 8, 9), FRIDAY)).toBe(false);
    });

    // La comparación es por día natural: una fecha con hora tardía no debe
    // caer fuera de la ventana solo por el tramo horario.
    it('no depende de la hora del día', () => {
      const topeDeMadrugada = new Date(2026, 7, 23, 23, 59);
      expect(isWithinBookingWindow(topeDeMadrugada, FRIDAY)).toBe(true);
    });
  });
});
