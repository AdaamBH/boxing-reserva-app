import { createClient } from 'jsr:@supabase/supabase-js@2';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta automáticamente el
// runtime de Edge Functions (local y cloud) — nunca hay que configurarlos
// a mano. Service role a propósito: estas funciones necesitan leer datos
// (reservas, dependientes, email del usuario en auth.users) que RLS le
// ocultaría a un cliente normal.
export function createSupabaseAdminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Faltan las variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return createClient(url, serviceRoleKey);
}
