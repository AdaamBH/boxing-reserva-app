import { supabase } from '@/lib/supabase';
import type { AddDependentFormValues } from '@/features/dependents/schemas';

export async function addDependent(values: AddDependentFormValues): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  if (!user) {
    throw new Error('Tienes que iniciar sesión para añadir un dependiente.');
  }

  // Llegados aquí, Zod ya ha comprobado que values.consentimiento es
  // true — este es el único punto del código que puede afirmar con
  // honestidad "hubo consentimiento en este instante". No es un valor
  // por defecto de la columna a propósito (ver migración).
  const payload = {
    parent_user_id: user.id,
    nombre: values.nombre,
    apellidos: values.apellidos,
    fecha_nacimiento: values.fechaNacimiento,
    relacion: values.relacion,
    consent_given_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('dependents').insert(payload);

  if (error) {
    throw new Error('No se ha podido guardar. Inténtalo de nuevo en unos segundos.');
  }
}
