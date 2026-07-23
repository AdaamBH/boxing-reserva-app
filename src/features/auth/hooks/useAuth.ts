import { useSession } from '@/features/auth/hooks/useSession';
import { useProfile } from '@/features/auth/hooks/useProfile';

/**
 * Combina sesión (Supabase Auth) y perfil (tabla `profiles`) en un único
 * punto de lectura — así ningún componente necesita saber que son dos
 * fuentes de datos distintas ni componer los dos hooks por su cuenta.
 */
export function useAuth() {
  const { session, isLoading: isSessionLoading } = useSession();
  const userId = session?.user.id;

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(userId);

  return {
    session,
    user: session?.user ?? null,
    profile: profile ?? null,
    isAuthenticated: session !== null,
    isAdmin: profile?.role === 'admin',
    // Sin sesión, no tiene sentido esperar al perfil — solo se considera
    // "cargando perfil" si de verdad hay una sesión de la que colgarlo.
    // Evita un isLoading atascado en true para un visitante sin cuenta.
    isLoading: isSessionLoading || (session !== null && isProfileLoading),
    profileError,
  };
}
