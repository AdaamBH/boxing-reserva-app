// Todas las funciones de este módulo trabajan en fecha LOCAL, nunca en
// UTC — igual motivo que formatSpanishDate/isSessionPast: la sesión de
// boxeo del lunes tiene que seguir siendo "lunes" sin importar el huso
// horario del dispositivo.

export const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

export function todayLocalDateString(): string {
  return toDateString(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Lunes de la semana que contiene `date` (semana L-D, no D-S). */
export function getWeekStart(date: Date): Date {
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return addDays(date, diffToMonday);
}

/** Los 7 días de la semana (L a D) empezando en `weekStart`. */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isSameDate(a: Date, b: Date): boolean {
  return toDateString(a) === toDateString(b);
}

/** L, M, X, J, V, S o D — igual que en la cabecera de la barra de días. */
export function formatWeekdayLetter(date: Date): string {
  return WEEKDAY_LETTERS[(date.getDay() + 6) % 7] as string;
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/**
 * Cuadrícula completa de semanas (L a D) que cubre el mes de `monthDate`,
 * incluyendo los días del mes anterior/siguiente necesarios para rellenar
 * la primera y la última semana — así el grid siempre tiene filas de 7.
 */
export function getMonthGridDates(monthDate: Date): Date[] {
  const monthStart = getMonthStart(monthDate);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridStart = getWeekStart(monthStart);
  const gridEnd = addDays(getWeekStart(monthEnd), 6);

  const dates: Date[] = [];
  for (let d = gridStart; d.getTime() <= gridEnd.getTime(); d = addDays(d, 1)) {
    dates.push(d);
  }
  return dates;
}

export function formatMonthLabel(date: Date): string {
  const month = date.toLocaleDateString('es-ES', { month: 'long' });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}
