import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SessionContext } from '@/features/auth/hooks/sessionContext';

/**
 * Única suscripción a `supabase.auth.onAuthStateChange` para toda la
 * aplicación. Vive aquí (no dentro de cada componente que necesite saber
 * "¿hay sesión?") para que un login/logout se refleje en todas partes a
 * la vez, sin suscripciones duplicadas ni estados desincronizados entre
 * componentes.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}
