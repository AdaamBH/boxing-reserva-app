import { supabase } from '@/lib/supabase';
import type {
  BookClassSessionParams,
  BookingError,
  BookingErrorCode,
  BookingResult,
  BookingWithSession,
  CancelBookingParams,
  LeaveWaitlistParams,
  RosterEntry,
  WaitlistEntryWithSession,
} from '@/features/bookings/types';

// SQLSTATE compartido que book_class_session/cancel_booking/leave_waitlist
// usan para marcar "esto es un resultado de negocio esperado" (ver
// AI/DECISIONS.md). Cualquier otro error.code es un fallo de infraestructura
// real (red, RLS, bug) y se trata como excepción, no como resultado tipado.
const BUSINESS_ERROR_CODE = 'BK001';

const BUSINESS_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  SESSION_NOT_FOUND: 'Esta clase ya no existe.',
  SESSION_CANCELLED: 'Esta clase ha sido cancelada.',
  SESSION_IN_PAST: 'Esta clase ya ha empezado o ha terminado.',
  NOT_YOUR_DEPENDENT: 'Ese dependiente no pertenece a tu cuenta.',
  ALREADY_BOOKED: 'Ya tienes una reserva o estás en la lista de espera para esta clase.',
  BOOKING_NOT_FOUND: 'Esa reserva no existe o no te pertenece.',
  ALREADY_CANCELLED: 'Esa reserva ya estaba cancelada.',
  CANCELLATION_TOO_LATE: 'Ya no puedes cancelar: falta menos de 1 hora para la clase.',
};

function isBookingErrorCode(value: string): value is BookingErrorCode {
  return value in BUSINESS_ERROR_MESSAGES;
}

// El MESSAGE que lanza la función de Postgres es siempre uno de los 8
// códigos conocidos (los controlamos nosotros en la migración) — si algún
// día no lo fuera, es una señal de un bug real, no un resultado de negocio
// que debamos fingir reconocer.
function toBookingError(message: string): BookingError {
  if (!isBookingErrorCode(message)) {
    throw new Error('Algo ha fallado. Inténtalo de nuevo en unos segundos.');
  }
  return { code: message, message: BUSINESS_ERROR_MESSAGES[message] };
}

export async function bookClassSession({
  sessionId,
  dependentId = null,
}: BookClassSessionParams): Promise<BookingResult<'confirmada' | 'en_espera'>> {
  // `exactOptionalPropertyTypes` no deja asignar `undefined` a una propiedad
  // opcional del tipo generado — se omite la clave entera en vez de
  // ponerla a `undefined` cuando no hay dependiente.
  const { data, error } = await supabase.rpc('book_class_session', {
    p_session_id: sessionId,
    ...(dependentId ? { p_dependent_id: dependentId } : {}),
  });

  if (error) {
    if (error.code === BUSINESS_ERROR_CODE) {
      return { success: false, error: toBookingError(error.message) };
    }
    console.error(error);
    throw new Error(
      'No se ha podido completar la reserva. Inténtalo de nuevo en unos segundos.',
    );
  }

  return { success: true, data: data as 'confirmada' | 'en_espera' };
}

// Best-effort a propósito: un fallo enviando el email de notificación
// nunca debe hacer parecer que la cancelación en sí ha fallado — la
// reserva ya está cancelada (o promocionada) en la base de datos pase lo
// que pase aquí. Se registra el error y no se relanza.
async function notifyBookingEvent(
  functionName: 'send_cancellation_email' | 'send_waitlist_promotion_email',
  bookingId: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke(functionName, {
    body: { bookingId },
  });
  if (error) {
    console.error(error);
  }
}

export async function cancelBooking({
  bookingId,
}: CancelBookingParams): Promise<BookingResult<{ promoted: boolean }>> {
  const { data, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
  });

  if (error) {
    if (error.code === BUSINESS_ERROR_CODE) {
      return { success: false, error: toBookingError(error.message) };
    }
    console.error(error);
    throw new Error(
      'No se ha podido cancelar la reserva. Inténtalo de nuevo en unos segundos.',
    );
  }

  const result = data[0];
  // El tipo generado marca `promoted_booking_id` como `string` no
  // opcional, pero la función SQL sí puede devolver null (sin nadie que
  // promocionar) — supabase gen types no infiere esa nulabilidad para
  // `returns table`.
  const promotedBookingId = (result?.promoted_booking_id ?? null) as string | null;

  await notifyBookingEvent('send_cancellation_email', bookingId);
  if (promotedBookingId) {
    await notifyBookingEvent('send_waitlist_promotion_email', promotedBookingId);
  }

  return { success: true, data: { promoted: result?.promoted ?? false } };
}

export async function leaveWaitlist({
  waitlistEntryId,
}: LeaveWaitlistParams): Promise<BookingResult<void>> {
  const { error } = await supabase.rpc('leave_waitlist', {
    p_waitlist_entry_id: waitlistEntryId,
  });

  if (error) {
    if (error.code === BUSINESS_ERROR_CODE) {
      return { success: false, error: toBookingError(error.message) };
    }
    console.error(error);
    throw new Error(
      'No se ha podido salir de la lista de espera. Inténtalo de nuevo en unos segundos.',
    );
  }

  return { success: true, data: undefined };
}

export async function fetchMyBookings(): Promise<BookingWithSession[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, session:class_sessions(*, trainer:trainers(*))')
    .eq('estado', 'confirmada')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      'No se han podido cargar tus reservas. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data as BookingWithSession[];
}

// A diferencia de fetchMyBookings (solo estado='confirmada', para decidir
// qué CTA mostrar en una sesión), esta trae TODAS las reservas del usuario
// sin filtrar por estado — la pestaña "Historial" de Mis reservas necesita
// ver también las canceladas, no solo las que siguen en pie.
export async function fetchMyBookingHistory(): Promise<BookingWithSession[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, session:class_sessions(*, trainer:trainers(*))')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      'No se han podido cargar tus clases. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data as BookingWithSession[];
}

export async function fetchMyWaitlistEntries(): Promise<WaitlistEntryWithSession[]> {
  const { data, error } = await supabase
    .from('waitlist_entries')
    .select('*, session:class_sessions(*, trainer:trainers(*))')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(
      'No se ha podido cargar tu lista de espera. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data as WaitlistEntryWithSession[];
}

export async function fetchSessionOccupancy(
  sessionIds: string[],
): Promise<Record<string, number>> {
  if (sessionIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase.rpc('get_session_occupancy', {
    p_session_ids: sessionIds,
  });

  if (error) {
    throw new Error(
      'No se ha podido calcular el aforo. Inténtalo de nuevo en unos segundos.',
    );
  }

  return Object.fromEntries(data.map((row) => [row.session_id, row.ocupadas]));
}

export async function fetchSessionRoster(sessionId: string): Promise<RosterEntry[]> {
  const { data, error } = await supabase.rpc('get_session_roster', {
    p_session_id: sessionId,
  });

  if (error) {
    throw new Error(
      'No se ha podido cargar la lista de la clase. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data;
}
