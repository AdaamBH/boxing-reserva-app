import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/features/auth/types';

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

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
