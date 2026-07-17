import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env y rellénalas (ver CONTRIBUTING.md).',
  );
}

// TODO(Fase 1): sustituir este cliente sin tipar por `createClient<Database>(...)`
// en cuanto exista `src/types/database.ts` generado desde el esquema real
// (ver DATABASE.md y el script `supabase gen types`).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
