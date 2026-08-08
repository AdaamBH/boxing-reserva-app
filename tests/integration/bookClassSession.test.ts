import { beforeAll, describe, expect, it } from 'vitest';
import {
  adminClient,
  createTestClassSession,
  createTestTrainer,
  createTestUser,
} from './helpers';

describe('book_class_session', () => {
  let trainerId: string;

  beforeAll(async () => {
    trainerId = await createTestTrainer();
  });

  // El test más importante del proyecto (AI/TESTING.md): prueba directa de
  // que el FOR UPDATE sobre class_sessions serializa reservas concurrentes
  // en vez de dejarlas correr en paralelo.
  it('dos reservas simultáneas para la última plaza: una se confirma y la otra va a lista de espera, nunca las dos confirmadas', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const [userA, userB] = await Promise.all([createTestUser(), createTestUser()]);

    const [resultA, resultB] = await Promise.all([
      userA.client.rpc('book_class_session', { p_session_id: sessionId }),
      userB.client.rpc('book_class_session', { p_session_id: sessionId }),
    ]);

    expect(resultA.error).toBeNull();
    expect(resultB.error).toBeNull();
    expect([resultA.data, resultB.data].sort()).toEqual(['confirmada', 'en_espera']);

    // Segunda comprobación independiente, directamente contra la tabla —
    // no basta con confiar en lo que devuelven las dos llamadas.
    const { data: confirmedBookings, error } = await adminClient
      .from('bookings')
      .select('id')
      .eq('session_id', sessionId)
      .eq('estado', 'confirmada');

    expect(error).toBeNull();
    expect(confirmedBookings).toHaveLength(1);
  });

  it('SESSION_NOT_FOUND cuando la sesión no existe', async () => {
    const user = await createTestUser();

    const { error } = await user.client.rpc('book_class_session', {
      p_session_id: '00000000-0000-0000-0000-000000000000',
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('SESSION_NOT_FOUND');
  });

  it('SESSION_CANCELLED cuando la sesión está cancelada', async () => {
    const sessionId = await createTestClassSession({ trainerId });
    await adminClient
      .from('class_sessions')
      .update({ estado: 'cancelada' })
      .eq('id', sessionId);
    const user = await createTestUser();

    const { error } = await user.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('SESSION_CANCELLED');
  });

  it('SESSION_IN_PAST cuando la sesión ya ha empezado', async () => {
    const sessionId = await createTestClassSession({ trainerId, offsetMinutes: -60 });
    const user = await createTestUser();

    const { error } = await user.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('SESSION_IN_PAST');
  });

  it('NOT_YOUR_DEPENDENT cuando el dependiente no pertenece al usuario que llama', async () => {
    const sessionId = await createTestClassSession({ trainerId });
    const owner = await createTestUser();
    const other = await createTestUser();

    const { data: dependent, error: dependentError } = await adminClient
      .from('dependents')
      .insert({
        parent_user_id: owner.id,
        nombre: 'Hijo',
        apellidos: 'De Prueba',
        fecha_nacimiento: '2015-01-01',
        relacion: 'madre',
        consent_given_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    expect(dependentError).toBeNull();

    const { error } = await other.client.rpc('book_class_session', {
      p_session_id: sessionId,
      p_dependent_id: dependent!.id,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('NOT_YOUR_DEPENDENT');
  });

  it('ALREADY_BOOKED cuando el usuario ya tiene una reserva confirmada para esa sesión', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 5 });
    const user = await createTestUser();

    const first = await user.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(first.error).toBeNull();
    expect(first.data).toBe('confirmada');

    const { error } = await user.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('ALREADY_BOOKED');
  });
});
