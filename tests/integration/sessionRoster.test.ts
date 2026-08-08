import { beforeAll, describe, expect, it } from 'vitest';
import {
  adminClient,
  createTestClassSession,
  createTestTrainer,
  createTestUser,
} from './helpers';

describe('get_session_roster', () => {
  let trainerId: string;

  beforeAll(async () => {
    trainerId = await createTestTrainer();
  });

  it('devuelve confirmados y lista de espera por separado, ordenados por antigüedad, con nombre + inicial del apellido', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const userA = await createTestUser();
    const userB = await createTestUser();
    const userC = await createTestUser();

    await adminClient
      .from('profiles')
      .update({ nombre: 'Ana', apellidos: 'García López' })
      .eq('id', userA.id);
    await adminClient
      .from('profiles')
      .update({ nombre: 'Bruno', apellidos: 'Díaz' })
      .eq('id', userB.id);

    // A confirmada, B en espera (aforo=1) — orden de llegada importa, así
    // que se reservan en secuencia, no en paralelo.
    const bookA = await userA.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookA.data).toBe('confirmada');
    const bookB = await userB.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(bookB.data).toBe('en_espera');

    // C reserva para un dependiente propio, también en espera — segundo
    // en la lista, detrás de B.
    const { data: dependent, error: dependentError } = await adminClient
      .from('dependents')
      .insert({
        parent_user_id: userC.id,
        nombre: 'Lucas',
        apellidos: 'Pérez Ruiz',
        fecha_nacimiento: '2015-01-01',
        relacion: 'padre',
        consent_given_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    expect(dependentError).toBeNull();

    const bookC = await userC.client.rpc('book_class_session', {
      p_session_id: sessionId,
      p_dependent_id: dependent!.id,
    });
    expect(bookC.data).toBe('en_espera');

    const { data: roster, error } = await userA.client.rpc('get_session_roster', {
      p_session_id: sessionId,
    });

    expect(error).toBeNull();
    expect(roster).toEqual([
      { estado: 'confirmada', display_name: 'Ana G.', orden: 1 },
      { estado: 'en_espera', display_name: 'Bruno D.', orden: 1 },
      { estado: 'en_espera', display_name: 'Lucas P.', orden: 2 },
    ]);
  });

  it('devuelve un array vacío para una sesión sin reservas', async () => {
    const sessionId = await createTestClassSession({ trainerId });
    const user = await createTestUser();

    const { data: roster, error } = await user.client.rpc('get_session_roster', {
      p_session_id: sessionId,
    });

    expect(error).toBeNull();
    expect(roster).toEqual([]);
  });
});
