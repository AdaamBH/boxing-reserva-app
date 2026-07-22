import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type RecoveryStatus = 'esperando' | 'lista' | 'no-detectada';

const TIEMPO_ESPERA_MS = 3000;

/**
 * Detecta si la página actual se ha cargado desde un enlace de
 * recuperación válido. No basta con mirar si hay sesión (useSession) —
 * una sesión de recuperación no se distingue de una normal salvo por este
 * evento concreto. Si el evento no llega en unos segundos (enlace
 * caducado, o alguien navegando aquí directamente sin enlace), se asume
 * que no es válido en vez de dejar una espera eterna sin explicación
 * (AI_REVIEW_CHECKLIST.md: estados de carga y error comprensibles).
 */
export function usePasswordRecoverySession(): RecoveryStatus {
  const [status, setStatus] = useState<RecoveryStatus>('esperando');

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('lista');
      }
    });

    const timeoutId = setTimeout(() => {
      setStatus((current) => (current === 'esperando' ? 'no-detectada' : current));
    }, TIEMPO_ESPERA_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return status;
}
