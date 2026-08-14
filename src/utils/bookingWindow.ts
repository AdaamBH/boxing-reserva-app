import { addDays, getWeekStart, toDateString } from '@/utils/calendarDates';

/**
 * Cuántas semanas MÁS ALLÁ de la semana en curso se pueden ver y reservar.
 * `1` = la semana actual y la siguiente, nada más.
 *
 * Regla de negocio pedida por el cliente: `pg_cron` genera sesiones con 4
 * semanas de antelación (ver DATABASE.md), y si todas fueran visibles los
 * más rápidos reservarían de una sentada las clases de todo el mes, con lo
 * que siempre acabarían entrando los mismos. Obligando a reservar semana a
 * semana el reparto de plazas es más justo (ver AI/DECISIONS.md).
 *
 * OJO — este número está DUPLICADO a propósito dentro de
 * `book_class_session` (migración 20260814190000). El límite de esta
 * pantalla es solo comodidad: quien llame a la RPC a mano se lo salta, así
 * que el que de verdad manda es el de Postgres. Si cambia uno, tiene que
 * cambiar el otro — no hay forma de compartir una constante entre el
 * bundle del navegador y una función plpgsql.
 */
export const BOOKABLE_WEEKS_AHEAD = 1;

/** Lunes de la última semana a la que se puede navegar. */
export function getLastBookableWeekStart(today: Date = new Date()): Date {
  return addDays(getWeekStart(today), BOOKABLE_WEEKS_AHEAD * 7);
}

/** Domingo de esa última semana: el último día reservable, incluido. */
export function getLastBookableDate(today: Date = new Date()): Date {
  return addDays(getLastBookableWeekStart(today), 6);
}

/**
 * Comparación por cadena `AAAA-MM-DD` (ordenable lexicográficamente) en vez
 * de por timestamp: así el corte es por día natural y no depende de la hora
 * a la que se abra la pantalla.
 */
export function isWithinBookingWindow(date: Date, today: Date = new Date()): boolean {
  return toDateString(date) <= toDateString(getLastBookableDate(today));
}
