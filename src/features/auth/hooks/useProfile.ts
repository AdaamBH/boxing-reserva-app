import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/utils/withTimeout';
import type { Profile } from '@/features/auth/types';

// Ver withTimeout.ts: esta consulta bloquea ProtectedRoute (PageFallback en
// pantalla completa) mientras está pendiente — sin límite, una red inestable
// deja al usuario mirando "Cargando…" para siempre, sin error ni forma de
// reintentar salvo recargar a ciegas.
const PROFILE_TIMEOUT_MS = 15_000;
const PROFILE_TIMEOUT_MESSAGE =
  'La conexión está tardando demasiado. Comprueba tu conexión a internet e inténtalo de nuevo.';

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await withTimeout(
    supabase.from('profiles').select('*').eq('id', userId).single(),
    PROFILE_TIMEOUT_MS,
    PROFILE_TIMEOUT_MESSAGE,
  );

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Trae el perfil (`profiles`) del usuario indicado. Deliberadamente no
 * decide por sí solo quién es "el usuario actual" — eso es responsabilidad
 * de `useAuth`, que lo combina con `useSession`. Así este hook se puede
 * reutilizar tal cual el día que el admin necesite consultar el perfil de
 * otro usuario, sin reescribir nada aquí.
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('useProfile: userId no puede estar vacío');
      }
      return fetchProfile(userId);
    },
    enabled: Boolean(userId),
  });
}
