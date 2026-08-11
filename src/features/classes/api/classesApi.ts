import { supabase } from '@/lib/supabase';
import type { ClassSessionWithTrainer } from '@/features/classes/types';
import { todayLocalDateString } from '@/utils/calendarDates';

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

/**
 * Trae las sesiones programadas entre dos fechas (ambas inclusive, formato
 * YYYY-MM-DD). Base de datos compartida por el Calendario (vista de mes) y
 * Reservas (vista de semana) — ambos derivan la disponibilidad de qué
 * sesiones existen, no de una tabla de días abiertos/cerrados aparte.
 */
export async function fetchClassSessionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<ClassSessionWithTrainer[]> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, trainer:trainers(*)')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
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

export async function fetchClassSessionById(
  sessionId: string,
): Promise<ClassSessionWithTrainer> {
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, trainer:trainers(*)')
    .eq('id', sessionId)
    .single();

  if (error) {
    throw new Error(
      'No se ha podido cargar la clase. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data as ClassSessionWithTrainer;
}
