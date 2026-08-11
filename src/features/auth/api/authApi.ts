import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { withTimeout } from '@/utils/withTimeout';
import type { RegisterFormValues } from '@/features/auth/schemas';

export interface SignUpResult {
  needsEmailConfirmation: boolean;
}

// Ver withTimeout.ts: sin esto, una red inestable puede dejar cualquiera de
// estas llamadas colgada para siempre, con el botón en "Cargando…" sin
// error ni forma de reintentar salvo recargar a ciegas.
const AUTH_TIMEOUT_MS = 15_000;
const TIMEOUT_MESSAGE =
  'La conexión está tardando demasiado. Comprueba tu conexión a internet e inténtalo de nuevo.';

/**
 * Registra una cuenta nueva. Los datos de perfil (nombre, apellidos,
 * teléfono, fecha de nacimiento) viajan como metadata de usuario en
 * `options.data`; el trigger `handle_new_user` (ver migración de
 * `supabase/migrations/`) los copia a `profiles` automáticamente — el
 * frontend nunca escribe directamente en `profiles` durante el registro.
 *
 * Con "Confirm email" activo (comportamiento por defecto de Supabase
 * adoptado tal cual, ver SECURITY.md y DECISIONS.md), esto NO deja al
 * usuario con sesión iniciada: `needsEmailConfirmation` es siempre `true`
 * mientras esa opción del proyecto de Supabase siga activada.
 */
export async function signUp(values: RegisterFormValues): Promise<SignUpResult> {
  const { error } = await withTimeout(
    supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nombre: values.nombre,
          apellidos: values.apellidos,
          telefono: values.telefono,
          fecha_nacimiento: values.fechaNacimiento,
        },
      },
    }),
    AUTH_TIMEOUT_MS,
    TIMEOUT_MESSAGE,
  );

  if (error) {
    throw new Error(translateAuthError(error));
  }

  return { needsEmailConfirmation: true };
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await withTimeout(
    supabase.auth.signInWithPassword({ email, password }),
    AUTH_TIMEOUT_MS,
    TIMEOUT_MESSAGE,
  );
  if (error) {
    throw new Error(translateAuthError(error));
  }
}

export async function signOut(): Promise<void> {
  const { error } = await withTimeout(
    supabase.auth.signOut(),
    AUTH_TIMEOUT_MS,
    TIMEOUT_MESSAGE,
  );
  if (error) {
    throw new Error(translateAuthError(error));
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await withTimeout(
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    }),
    AUTH_TIMEOUT_MS,
    TIMEOUT_MESSAGE,
  );
  if (error) {
    throw new Error(translateAuthError(error));
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await withTimeout(
    supabase.auth.updateUser({ password: newPassword }),
    AUTH_TIMEOUT_MS,
    TIMEOUT_MESSAGE,
  );
  if (error) {
    throw new Error(translateAuthError(error));
  }
}

/**
 * Traduce los mensajes de error más comunes de Supabase Auth a español
 * claro y sin jerga técnica (ver AI_REVIEW_CHECKLIST.md). No es una lista
 * exhaustiva a propósito (YAGNI) — se amplía según vayan apareciendo casos
 * reales; cualquier error no reconocido cae en un mensaje genérico en vez
 * de mostrar el texto técnico en crudo (ver ENGINEERING_RULES.md).
 */
function translateAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();

  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Ya existe una cuenta con este email. ¿Quizás quieres iniciar sesión?';
  }
  if (message.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.';
  }
  if (message.includes('email not confirmed')) {
    return 'Todavía no has confirmado tu email. Revisa tu bandeja de entrada.';
  }
  if (message.includes('password') && message.includes('least')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (message.includes('rate limit')) {
    return 'Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.';
  }

  return 'Algo ha fallado. Inténtalo de nuevo en unos segundos.';
}
