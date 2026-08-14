import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpcMock = vi.fn();
const invokeMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    functions: { invoke: (...args: unknown[]) => invokeMock(...args) },
  },
}));

const { bookClassSession, cancelBooking, leaveWaitlist, fetchSessionOccupancy } =
  await import('@/features/bookings/api/bookingsApi');

describe('bookClassSession', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('devuelve un resultado de éxito con el veredicto de la RPC', async () => {
    rpcMock.mockResolvedValue({ data: 'confirmada', error: null });

    const result = await bookClassSession({ sessionId: 'session-1' });

    expect(result).toEqual({ success: true, data: 'confirmada' });
    expect(rpcMock).toHaveBeenCalledWith('book_class_session', {
      p_session_id: 'session-1',
    });
  });

  it('incluye p_dependent_id solo cuando se reserva para un dependiente', async () => {
    rpcMock.mockResolvedValue({ data: 'en_espera', error: null });

    await bookClassSession({ sessionId: 'session-1', dependentId: 'dep-1' });

    expect(rpcMock).toHaveBeenCalledWith('book_class_session', {
      p_session_id: 'session-1',
      p_dependent_id: 'dep-1',
    });
  });

  it('traduce un error de negocio (BK001) a un resultado tipado', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: 'BK001', message: 'ALREADY_BOOKED' },
    });

    const result = await bookClassSession({ sessionId: 'session-1' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'ALREADY_BOOKED',
        message: 'Ya tienes una reserva o estás en la lista de espera para esta clase.',
      },
    });
  });

  // Tope de la ventana de reserva: la RPC lo rechaza aunque la pantalla
  // haya dejado llegar hasta ahí (ver bookingWindow.ts y la migración
  // 20260814190000).
  it('traduce SESSION_TOO_FAR_AHEAD a un resultado tipado', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: 'BK001', message: 'SESSION_TOO_FAR_AHEAD' },
    });

    const result = await bookClassSession({ sessionId: 'session-1' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'SESSION_TOO_FAR_AHEAD',
        message: 'Esta clase todavía no se puede reservar: se abren semana a semana.',
      },
    });
  });

  it('relanza como excepción genérica cualquier error que no sea de negocio', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: '500', message: 'connection refused' },
    });

    await expect(bookClassSession({ sessionId: 'session-1' })).rejects.toThrow(
      'No se ha podido completar la reserva. Inténtalo de nuevo en unos segundos.',
    );
  });
});

describe('cancelBooking', () => {
  beforeEach(() => {
    rpcMock.mockReset();
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({ data: null, error: null });
  });

  it('devuelve promoted=true y notifica a ambas Edge Functions cuando la RPC promociona a alguien', async () => {
    rpcMock.mockResolvedValue({
      data: [{ promoted: true, promoted_booking_id: 'booking-2' }],
      error: null,
    });

    const result = await cancelBooking({ bookingId: 'booking-1' });

    expect(result).toEqual({ success: true, data: { promoted: true } });
    expect(invokeMock).toHaveBeenCalledWith('send_cancellation_email', {
      body: { bookingId: 'booking-1' },
    });
    expect(invokeMock).toHaveBeenCalledWith('send_waitlist_promotion_email', {
      body: { bookingId: 'booking-2' },
    });
  });

  it('solo notifica la cancelación cuando nadie es promocionado', async () => {
    rpcMock.mockResolvedValue({
      data: [{ promoted: false, promoted_booking_id: null }],
      error: null,
    });

    await cancelBooking({ bookingId: 'booking-1' });

    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledWith('send_cancellation_email', {
      body: { bookingId: 'booking-1' },
    });
  });

  it('un fallo notificando por email no impide devolver la cancelación como exitosa', async () => {
    rpcMock.mockResolvedValue({
      data: [{ promoted: false, promoted_booking_id: null }],
      error: null,
    });
    invokeMock.mockResolvedValue({ data: null, error: { message: 'fallo de red' } });

    const result = await cancelBooking({ bookingId: 'booking-1' });

    expect(result).toEqual({ success: true, data: { promoted: false } });
  });

  it('traduce CANCELLATION_TOO_LATE a un resultado tipado', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: 'BK001', message: 'CANCELLATION_TOO_LATE' },
    });

    const result = await cancelBooking({ bookingId: 'booking-1' });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'CANCELLATION_TOO_LATE',
        message: 'Ya no puedes cancelar: falta menos de 1 hora para la clase.',
      },
    });
  });
});

describe('leaveWaitlist', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('devuelve éxito cuando la RPC no da error', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });

    const result = await leaveWaitlist({ waitlistEntryId: 'wl-1' });

    expect(result).toEqual({ success: true, data: undefined });
  });
});

describe('fetchSessionOccupancy', () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it('devuelve un objeto vacío sin llamar a la RPC si no hay ids', async () => {
    const result = await fetchSessionOccupancy([]);

    expect(result).toEqual({});
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('mapea el array de la RPC a un Record por session_id', async () => {
    rpcMock.mockResolvedValue({
      data: [
        { session_id: 'a', ocupadas: 3 },
        { session_id: 'b', ocupadas: 0 },
      ],
      error: null,
    });

    const result = await fetchSessionOccupancy(['a', 'b']);

    expect(result).toEqual({ a: 3, b: 0 });
  });
});
