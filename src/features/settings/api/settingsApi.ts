import { supabase } from '@/lib/supabase';

// Escritura directa vía PostgREST, no una RPC: es una preferencia de
// cuenta, no lógica de negocio de reservas — "update_own_profile" (RLS)
// ya cubre esta columna igual que el resto del perfil. El valor solo
// llega desde <select> con los dependientes propios del usuario, así que
// nunca se envía un id ajeno a propósito; si aun así llegara uno inválido,
// book_class_session lo rechazaría igualmente (NOT_YOUR_DEPENDENT).
export async function updateDefaultDependent(dependentId: string | null): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (!user) {
    throw new Error('Tienes que iniciar sesión para cambiar este ajuste.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ default_dependent_id: dependentId })
    .eq('id', user.id);

  if (error) {
    throw new Error(
      'No se ha podido guardar el ajuste. Inténtalo de nuevo en unos segundos.',
    );
  }
}
