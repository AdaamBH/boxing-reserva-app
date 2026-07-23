import { useContext } from 'react';
import { SessionContext } from '@/features/auth/hooks/sessionContext';
import type { SessionContextValue } from '@/features/auth/hooks/sessionContext';

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession debe usarse dentro de un SessionProvider');
  }
  return context;
}
