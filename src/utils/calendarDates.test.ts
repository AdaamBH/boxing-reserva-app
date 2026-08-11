import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  formatMonthLabel,
  formatWeekdayLetter,
  getMonthGridDates,
  getWeekDates,
  getWeekStart,
  isSameDate,
  parseLocalDate,
  toDateString,
} from '@/utils/calendarDates';

describe('toDateString / parseLocalDate', () => {
  it('formatea una fecha local como YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 6, 9))).toBe('2026-07-09');
  });

  it('rellena con ceros mes y día de un solo dígito', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('parsea YYYY-MM-DD como fecha local, no UTC', () => {
    const parsed = parseLocalDate('2026-07-09');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(6);
    expect(parsed.getDate()).toBe(9);
  });
});

describe('getWeekStart', () => {
  it('devuelve el mismo lunes cuando la fecha ya es lunes', () => {
    // 2026-07-06 es lunes
    expect(toDateString(getWeekStart(new Date(2026, 6, 6)))).toBe('2026-07-06');
  });

  it('retrocede hasta el lunes cuando la fecha es un día intermedio', () => {
    // 2026-07-09 es jueves
    expect(toDateString(getWeekStart(new Date(2026, 6, 9)))).toBe('2026-07-06');
  });

  it('retrocede correctamente cuando la fecha es domingo', () => {
    // 2026-07-12 es domingo, el lunes de esa semana es el 06
    expect(toDateString(getWeekStart(new Date(2026, 6, 12)))).toBe('2026-07-06');
  });
});

describe('getWeekDates', () => {
  it('devuelve los 7 días de L a D empezando en weekStart', () => {
    const weekStart = new Date(2026, 6, 6);
    const dates = getWeekDates(weekStart).map(toDateString);
    expect(dates).toEqual([
      '2026-07-06',
      '2026-07-07',
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
    ]);
  });
});

describe('formatWeekdayLetter', () => {
  it('devuelve L para un lunes', () => {
    expect(formatWeekdayLetter(new Date(2026, 6, 6))).toBe('L');
  });

  it('devuelve D para un domingo', () => {
    expect(formatWeekdayLetter(new Date(2026, 6, 12))).toBe('D');
  });

  it('devuelve X para un miércoles (no colisiona con M de martes)', () => {
    expect(formatWeekdayLetter(new Date(2026, 6, 8))).toBe('X');
  });
});

describe('isSameDate', () => {
  it('es true para el mismo día aunque difiera la hora', () => {
    expect(isSameDate(new Date(2026, 6, 9, 8), new Date(2026, 6, 9, 20))).toBe(true);
  });

  it('es false para días distintos', () => {
    expect(isSameDate(new Date(2026, 6, 9), new Date(2026, 6, 10))).toBe(false);
  });
});

describe('addDays / addMonths', () => {
  it('suma días cruzando el fin de mes', () => {
    expect(toDateString(addDays(new Date(2026, 6, 30), 3))).toBe('2026-08-02');
  });

  it('avanza al primer día del mes siguiente', () => {
    expect(toDateString(addMonths(new Date(2026, 6, 15), 1))).toBe('2026-08-01');
  });
});

describe('getMonthGridDates', () => {
  it('cubre semanas completas (múltiplo de 7) que incluyen todo el mes', () => {
    const dates = getMonthGridDates(new Date(2026, 6, 15));
    expect(dates.length % 7).toBe(0);

    const daysInJuly = dates.filter((d) => d.getMonth() === 6);
    expect(daysInJuly).toHaveLength(31);
  });

  it('empieza siempre en lunes y termina en domingo', () => {
    const dates = getMonthGridDates(new Date(2026, 6, 15));
    expect(dates[0]?.getDay()).toBe(1);
    expect(dates[dates.length - 1]?.getDay()).toBe(0);
  });
});

describe('formatMonthLabel', () => {
  it('capitaliza el mes en español', () => {
    expect(formatMonthLabel(new Date(2026, 6, 15))).toBe('Julio 2026');
  });
});
