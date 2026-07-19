import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
}

// Sin valor por defecto real a propósito: `undefined` permite a
// `useSession` distinguir "no hay provider por encima" de "sí hay
// provider, pero todavía no hay sesión" (este último es `session: null`,
// un valor legítimo, no un error de configuración).
export const SessionContext = createContext<SessionContextValue | undefined>(undefined);
