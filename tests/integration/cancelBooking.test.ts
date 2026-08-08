import { beforeAll, describe, expect, it } from 'vitest';
import {
  adminClient,
  createTestClassSession,
  createTestTrainer,
  createTestUser,
  getConfirmedBookingId,
} from './helpers';

describe('cancel_booking', () => {
  let trainerId: string;

  beforeAll(async () => {
    trainerId = await createTestTrainer();
  });

  it('cancela una reserva propia y promociona atómicamente al primero de la lista de espera', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const userA = await createTestUser();
    const userB = await createTestUser();

    const bookA = await userA.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookA.data).toBe('confirmada');
    const bookingIdA = await getConfirmedBookingId(sessionId, userA.id);

    const bookB = await userB.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookB.data).toBe('en_espera');

    const { data: cancelResult, error } = await userA.client.rpc('cancel_booking', {
      p_booking_id: bookingIdA,
    });
    expect(error).toBeNull();
    expect(cancelResult?.[0]?.promoted).toBe(true);

    const { data: confirmedBookings } = await adminClient
      .from('bookings')
      .select('id, user_id')
      .eq('session_id', sessionId)
      .eq('estado', 'confirmada');
    expect(confirmedBookings).toHaveLength(1);
    expect(confirmedBookings?.[0]?.user_id).toBe(userB.id);
    // El id que devuelve la RPC es justo el que usará el email de
    // promoción para saber a quién notificar (Fase 5) — no basta con que
    // "alguien" se haya promocionado, tiene que ser este id exacto.
    expect(cancelResult?.[0]?.promoted_booking_id).toBe(confirmedBookings?.[0]?.id);

    const { data: waitlist } = await adminClient
      .from('waitlist_entries')
      .select('id')
      .eq('session_id', sessionId);
    expect(waitlist).toHaveLength(0);
  });

  // Prueba el ordenamiento de locks descrito en el comentario de la
  // migración: la promoción de B y la nueva reserva de C compiten por la
  // misma plaza liberada, y el lock de la fila de la sesión decide quién
  // gana sin que ninguna de las dos pise a la otra.
  it('la promoción de la lista de espera y una nueva reserva compiten de forma segura por la plaza liberada', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const userA = await createTestUser();
    const userB = await createTestUser();
    const userC = await createTestUser();

    const bookA = await userA.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookA.data).toBe('confirmada');
    const bookingIdA = await getConfirmedBookingId(sessionId, userA.id);

    const bookB = await userB.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookB.data).toBe('en_espera');

    const [cancelResult, bookC] = await Promise.all([
      userA.client.rpc('cancel_booking', { p_booking_id: bookingIdA }),
      userC.client.rpc('book_class_session', { p_session_id: sessionId }),
    ]);

    expect(cancelResult.error).toBeNull();
    expect(cancelResult.data?.[0]?.promoted).toBe(true);
    expect(bookC.data).toBe('en_espera');

    const { data: confirmedBookings } = await adminClient
      .from('bookings')
      .select('user_id')
      .eq('session_id', sessionId)
      .eq('estado', 'confirmada');
    expect(confirmedBookings).toHaveLength(1);
    expect(confirmedBookings?.[0]?.user_id).toBe(userB.id);
  });

  it('CANCELLATION_TOO_LATE cuando faltan menos de 1h para la clase', async () => {
    const sessionId = await createTestClassSession({ trainerId, offsetMinutes: 30 });
    const user = await createTestUser();
    const book = await user.client.rpc('book_class_session', { p_session_id: sessionId });
    expect(book.data).toBe('confirmada');
    const bookingId = await getConfirmedBookingId(sessionId, user.id);

    const { error } = await user.client.rpc('cancel_booking', {
      p_booking_id: bookingId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('CANCELLATION_TOO_LATE');
  });

  it('BOOKING_NOT_FOUND cuando la reserva no pertenece a quien intenta cancelarla', async () => {
    const sessionId = await createTestClassSession({ trainerId });
    const owner = await createTestUser();
    const other = await createTestUser();
    const book = await owner.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(book.data).toBe('confirmada');
    const bookingId = await getConfirmedBookingId(sessionId, owner.id);

    const { error } = await other.client.rpc('cancel_booking', {
      p_booking_id: bookingId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('BOOKING_NOT_FOUND');
  });

  it('ALREADY_CANCELLED cuando se cancela una reserva ya cancelada', async () => {
    const sessionId = await createTestClassSession({ trainerId });
    const user = await createTestUser();
    const book = await user.client.rpc('book_class_session', { p_session_id: sessionId });
    expect(book.data).toBe('confirmada');
    const bookingId = await getConfirmedBookingId(sessionId, user.id);

    const first = await user.client.rpc('cancel_booking', { p_booking_id: bookingId });
    expect(first.error).toBeNull();

    const { error } = await user.client.rpc('cancel_booking', {
      p_booking_id: bookingId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('ALREADY_CANCELLED');
  });
});
