import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Claves por defecto del stack local de Supabase CLI (`supabase start`) —
// son las mismas para cualquier instalación local, no un secreto real.
// Overrideable por si algún día se apunta a un proyecto de Supabase
// distinto (branch en la nube, por ejemplo).
const SUPABASE_URL = process.env.SUPABASE_TEST_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY =
  process.env.SUPABASE_TEST_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_TEST_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// service_role se salta RLS a propósito: estos tests preparan datos
// (entrenadores, sesiones, dependientes) y verifican el estado final
// directamente, no ejercitan RLS de lectura — eso ya lo prueban las
// políticas en sí, aquí lo que importa es la atomicidad de las RPC.
export const adminClient: SupabaseClient<Database> = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export interface TestUser {
  id: string;
  client: SupabaseClient<Database>;
}

export async function createTestUser(): Promise<TestUser> {
  // crypto.randomUUID(), no Date.now()+contador: varios archivos de test
  // corren en paralelo, cada uno con su propio contador reiniciado a 0 —
  // dos procesos podían generar el mismo email en el mismo milisegundo.
  const email = `booking-test-${crypto.randomUUID()}@example.com`;
  const password = 'Test1234!';

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: 'Test', apellidos: 'User' },
  });

  if (error || !data.user) {
    throw new Error(`No se ha podido crear el usuario de prueba: ${error?.message}`);
  }

  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(
      `No se ha podido iniciar sesión con el usuario de prueba: ${signInError.message}`,
    );
  }

  return { id: data.user.id, client };
}

export async function createTestTrainer(): Promise<string> {
  const { data, error } = await adminClient
    .from('trainers')
    .insert({ nombre: 'Entrenador de prueba', activo: true })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`No se ha podido crear el entrenador de prueba: ${error?.message}`);
  }

  return data.id;
}

// Devuelve la fecha/hora locales de Madrid correspondientes a un instante
// dado — necesario porque book_class_session/cancel_booking interpretan
// fecha+hora_inicio como hora de pared de Madrid ("at time zone
// 'Europe/Madrid'"), y la máquina que ejecuta los tests puede estar en
// cualquier zona horaria.
function madridDateTimeParts(date: Date): { fecha: string; hora: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return {
    fecha: `${get('year')}-${get('month')}-${get('day')}`,
    hora: `${get('hour')}:${get('minute')}:${get('second')}`,
  };
}

interface CreateTestClassSessionParams {
  trainerId: string;
  aforoMaximo?: number;
  // Minutos desde ahora hasta el inicio de la sesión. Negativo = ya
  // empezada (para probar SESSION_IN_PAST); 30 = dentro de la ventana de
  // 1h de cancelación (CANCELLATION_TOO_LATE); por defecto, dentro de 2
  // días (camino feliz).
  offsetMinutes?: number;
}

export async function createTestClassSession({
  trainerId,
  aforoMaximo = 10,
  offsetMinutes = 60 * 24 * 2,
}: CreateTestClassSessionParams): Promise<string> {
  const start = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const { fecha, hora: horaInicio } = madridDateTimeParts(start);
  const { hora: horaFin } = madridDateTimeParts(end);

  const { data, error } = await adminClient
    .from('class_sessions')
    .insert({
      nombre: 'Sesión de prueba',
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      nivel: 'intermedio',
      trainer_id: trainerId,
      aforo_maximo: aforoMaximo,
      estado: 'programada',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`No se ha podido crear la sesión de prueba: ${error?.message}`);
  }

  return data.id;
}

export async function getConfirmedBookingId(
  sessionId: string,
  userId: string,
): Promise<string> {
  const { data, error } = await adminClient
    .from('bookings')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('estado', 'confirmada')
    .single();

  if (error || !data) {
    throw new Error(
      `No se ha encontrado la reserva confirmada de prueba: ${error?.message}`,
    );
  }

  return data.id;
}

export async function getWaitlistEntryId(
  sessionId: string,
  userId: string,
): Promise<string> {
  const { data, error } = await adminClient
    .from('waitlist_entries')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error(
      `No se ha encontrado la entrada de lista de espera de prueba: ${error?.message}`,
    );
  }

  return data.id;
}
