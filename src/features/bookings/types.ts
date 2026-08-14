import type { Database } from '@/types/database';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type WaitlistEntry = Database['public']['Tables']['waitlist_entries']['Row'];

export interface BookingWithSession extends Booking {
  session: ClassSessionWithTrainer;
}

export interface WaitlistEntryWithSession extends WaitlistEntry {
  session: ClassSessionWithTrainer;
}

// Debe coincidir exactamente con los MESSAGE que lanzan book_class_session/
// cancel_booking/leave_waitlist en la migración (errcode 'BK001').
export type BookingErrorCode =
  | 'SESSION_NOT_FOUND'
  | 'SESSION_CANCELLED'
  | 'SESSION_IN_PAST'
  | 'SESSION_TOO_FAR_AHEAD'
  | 'NOT_YOUR_DEPENDENT'
  | 'ALREADY_BOOKED'
  | 'BOOKING_NOT_FOUND'
  | 'ALREADY_CANCELLED'
  | 'CANCELLATION_TOO_LATE';

export interface BookingError {
  code: BookingErrorCode;
  message: string;
}

export type BookingResult<T> =
  { success: true; data: T } | { success: false; error: BookingError };

export interface BookClassSessionParams {
  sessionId: string;
  dependentId?: string | null;
}

export interface CancelBookingParams {
  bookingId: string;
}

export interface LeaveWaitlistParams {
  waitlistEntryId: string;
}

// Con qué relación (si alguna) tiene el usuario actual con una sesión
// concreta — lo que decide qué acción mostrar en su tarjeta (Reservar /
// Ya apuntado + ver lista / En lista de espera). Un usuario nunca tiene
// más de un estado por sesión: book_class_session bloquea ALREADY_BOOKED
// si ya hay reserva o entrada en lista de espera para esa sesión.
export type SessionBookingStatus =
  | { type: 'confirmed'; bookingId: string }
  | { type: 'waitlisted'; waitlistEntryId: string };

// "Nombre I." (nombre + inicial del apellido) — mismo formato para todos,
// adultos y menores, ya truncado por get_session_roster en la propia
// base de datos (nunca se recibe el apellido completo de otra persona).
export type RosterEntry =
  Database['public']['Functions']['get_session_roster']['Returns'][number];
