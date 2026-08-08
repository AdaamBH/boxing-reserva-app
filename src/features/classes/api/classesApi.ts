import { supabase } from '@/lib/supabase';
import type { ClassSessionWithTrainer } from '@/features/classes/types';

// Fecha local (no UTC) a propósito — mismo motivo que en la validación de
// edad: new Date().toISOString() puede desplazar el día según el huso
// horario, y aquí "hoy" tiene que ser el día real en España.
function todayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function fetchUpcomingClassSessions(): Promise<ClassSessionWithTrainer[]> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, trainer:trainers(*)')
    .gte('fecha', todayLocalDateString())
    .eq('estado', 'programada')
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true });

  if (error) {
    throw new Error(
      'No se han podido cargar las clases. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data as ClassSessionWithTrainer[];
}
