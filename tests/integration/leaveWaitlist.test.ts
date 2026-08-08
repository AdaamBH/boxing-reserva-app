import { beforeAll, describe, expect, it } from 'vitest';
import {
  adminClient,
  createTestClassSession,
  createTestTrainer,
  createTestUser,
  getWaitlistEntryId,
} from './helpers';

describe('leave_waitlist', () => {
  let trainerId: string;

  beforeAll(async () => {
    trainerId = await createTestTrainer();
  });

  it('borra la propia entrada de la lista de espera', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const userA = await createTestUser();
    const userB = await createTestUser();

    await userA.client.rpc('book_class_session', { p_session_id: sessionId });
    const waitResult = await userB.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(waitResult.data).toBe('en_espera');
    const entryId = await getWaitlistEntryId(sessionId, userB.id);

    const { error } = await userB.client.rpc('leave_waitlist', {
      p_waitlist_entry_id: entryId,
    });
    expect(error).toBeNull();

    const { data: remaining } = await adminClient
      .from('waitlist_entries')
      .select('id')
      .eq('id', entryId);
    expect(remaining).toHaveLength(0);
  });

  it('BOOKING_NOT_FOUND cuando la entrada no pertenece a quien la intenta borrar', async () => {
    const sessionId = await createTestClassSession({ trainerId, aforoMaximo: 1 });
    const owner = await createTestUser();
    const other = await createTestUser();

    await owner.client.rpc('book_class_session', { p_session_id: sessionId });
    const waitResult = await other.client.rpc('book_class_session', {
      p_session_id: sessionId,
    });
    expect(waitResult.data).toBe('en_espera');
    const entryId = await getWaitlistEntryId(sessionId, other.id);

    const { error } = await owner.client.rpc('leave_waitlist', {
      p_waitlist_entry_id: entryId,
    });

    expect(error?.code).toBe('BK001');
    expect(error?.message).toBe('BOOKING_NOT_FOUND');
  });
});
