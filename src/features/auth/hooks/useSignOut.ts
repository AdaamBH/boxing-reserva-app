import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/features/auth/api/authApi';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    // SessionProvider recoge el cierre de sesión vía el listener de
    // Supabase (ProtectedRoute redirige solo cuando isAuthenticated pasa
    // a false) — aquí solo hay que limpiar la caché de datos del usuario
    // saliente para que no se filtre a la siguiente sesión.
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
