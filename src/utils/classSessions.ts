/**
 * Calcula cuántas plazas quedan libres en una sesión.
 * Nunca devuelve un número negativo aunque, por algún fallo previo,
 * hubiera más reservas confirmadas que aforo — mejor mostrar 0 que un
 * "-2 plazas libres" sin sentido para el usuario.
 */
export function getRemainingSpots(aforoMaximo: number, ocupadas: number): number {
  return Math.max(0, aforoMaximo - ocupadas);
}

export function isSessionFull(aforoMaximo: number, ocupadas: number): boolean {
  return getRemainingSpots(aforoMaximo, ocupadas) === 0;
}

/**
 * Solo un aviso de UX (deshabilita el botón antes de intentarlo) — la
 * autoridad real es la comprobación SESSION_IN_PAST dentro de
 * book_class_session en la base de datos, esto no la sustituye.
 * `${fecha}T${horaInicio}` sin "Z" a propósito, igual que formatSpanishDate:
 * fuerza a interpretar la fecha/hora en local, no en UTC.
 */
export function isSessionPast(
  fecha: string,
  horaInicio: string,
  now: Date = new Date(),
): boolean {
  return new Date(`${fecha}T${horaInicio}`).getTime() <= now.getTime();
}

const CANCELLATION_WINDOW_MS = 60 * 60 * 1000;

/**
 * Mismo aviso de UX que isSessionPast, no la autoridad — cancel_booking en
 * la base de datos es quien de verdad rechaza una cancelación tardía
 * (CANCELLATION_TOO_LATE).
 */
export function canCancelBooking(
  fecha: string,
  horaInicio: string,
  now: Date = new Date(),
): boolean {
  const sessionStart = new Date(`${fecha}T${horaInicio}`).getTime();
  return sessionStart - now.getTime() > CANCELLATION_WINDOW_MS;
}
