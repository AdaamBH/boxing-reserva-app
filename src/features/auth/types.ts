import type { Database } from '@/types/database';

// Punto único desde el que el resto de `features/auth` importa el tipo de
// perfil, en vez de escribir `Database['public']['Tables']['profiles']['Row']`
// en cada archivo. Nota deliberada: `role` queda tipado como `string`, no
// como `'alumno' | 'admin'` — el `check` de la migración vive en Postgres,
// no en un enum nativo, así que `supabase gen types` no lo estrecha a un
// literal. No se fuerza aquí un tipo más estricto a mano porque se
// desincronizaría del origen real en cuanto alguien tocara la restricción
// en SQL sin acordarse de este archivo.
export type Profile = Database['public']['Tables']['profiles']['Row'];