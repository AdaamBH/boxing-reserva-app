import { supabase } from '@/lib/supabase';
import type { ClassTemplate } from '@/features/admin/types';
import type {
  ClassTemplateFormValues,
  OneOffClassSessionFormValues,
} from '@/features/admin/schemas';

export async function fetchClassTemplates(): Promise<ClassTemplate[]> {
  const { data, error } = await supabase
    .from('class_templates')
    .select('*')
    .order('dia_semana', { ascending: true })
    .order('hora_inicio', { ascending: true });

  if (error) {
    throw new Error(
      'No se han podido cargar las plantillas. Inténtalo de nuevo en unos segundos.',
    );
  }

  return data;
}

function toTemplateRow(values: ClassTemplateFormValues) {
  return {
    nombre: values.nombre,
    dia_semana: values.diaSemana,
    hora_inicio: values.horaInicio,
    hora_fin: values.horaFin,
    nivel: values.nivel,
    trainer_id: values.trainerId,
    aforo_maximo: values.aforoMaximo,
  };
}

export async function createClassTemplate(
  values: ClassTemplateFormValues,
): Promise<void> {
  const { error } = await supabase.from('class_templates').insert(toTemplateRow(values));

  if (error) {
    throw new Error(
      'No se ha podido crear la plantilla. Inténtalo de nuevo en unos segundos.',
    );
  }
}

export async function updateClassTemplate(
  id: string,
  values: ClassTemplateFormValues,
): Promise<void> {
  const { error } = await supabase
    .from('class_templates')
    .update(toTemplateRow(values))
    .eq('id', id);

  if (error) {
    throw new Error(
      'No se han podido guardar los cambios. Inténtalo de nuevo en unos segundos.',
    );
  }
}

export async function setClassTemplateActive(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('class_templates')
    .update({ activo })
    .eq('id', id);

  if (error) {
    throw new Error(
      'No se ha podido cambiar el estado de la plantilla. Inténtalo de nuevo.',
    );
  }
}

export async function createOneOffClassSession(
  values: OneOffClassSessionFormValues,
): Promise<void> {
  const { error } = await supabase.from('class_sessions').insert({
    // template_id null a propósito: es justo lo que distingue una sesión
    // suelta de una generada desde una plantilla (ver migración).
    template_id: null,
    nombre: values.nombre,
    fecha: values.fecha,
    hora_inicio: values.horaInicio,
    hora_fin: values.horaFin,
    nivel: values.nivel,
    trainer_id: values.trainerId,
    aforo_maximo: values.aforoMaximo,
  });

  if (error) {
    throw new Error(
      'No se ha podido crear la sesión. Inténtalo de nuevo en unos segundos.',
    );
  }
}

export async function cancelClassSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('class_sessions')
    .update({ estado: 'cancelada' })
    .eq('id', id);

  if (error) {
    throw new Error(
      'No se ha podido cancelar la sesión. Inténtalo de nuevo en unos segundos.',
    );
  }
}
