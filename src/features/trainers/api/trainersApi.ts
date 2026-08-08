import { supabase } from '@/lib/supabase';
import type { Trainer } from '@/features/trainers/types';

export async function fetchActiveTrainers(): Promise<Trainer[]> {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(
      'No se han podido cargar los entrenadores. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data;
}
