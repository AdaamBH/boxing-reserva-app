import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOneOffClassSession } from '@/features/admin/api/adminClassesApi';
import type { OneOffClassSessionFormValues } from '@/features/admin/schemas';

export function useCreateOneOffClassSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: OneOffClassSessionFormValues) =>
      createOneOffClassSession(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
    },
  });
}
