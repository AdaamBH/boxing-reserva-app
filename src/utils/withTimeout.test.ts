import { describe, expect, it, vi } from 'vitest';
import { withTimeout } from '@/utils/withTimeout';

describe('withTimeout', () => {
  it('resuelve con el valor original si la promesa termina a tiempo', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 100, 'timeout')).resolves.toBe('ok');
  });

  it('rechaza con el error original si la promesa falla a tiempo', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 100, 'timeout'),
    ).rejects.toThrow('boom');
  });

  it('rechaza con el mensaje de timeout si la promesa nunca se resuelve', async () => {
    vi.useFakeTimers();
    const neverResolves = new Promise(() => {});

    const result = withTimeout(neverResolves, 1000, 'se ha colgado');
    const assertion = expect(result).rejects.toThrow('se ha colgado');

    await vi.advanceTimersByTimeAsync(1000);
    await assertion;

    vi.useRealTimers();
  });
});
