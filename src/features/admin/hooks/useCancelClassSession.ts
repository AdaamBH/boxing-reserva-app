import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelClassSession } from '@/features/admin/api/adminClassesApi';

export function useCancelClassSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelClassSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
    },
  });
}
