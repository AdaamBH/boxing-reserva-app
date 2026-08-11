import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDefaultDependent } from '@/features/settings/api/settingsApi';

export function useUpdateDefaultDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dependentId: string | null) => updateDefaultDependent(dependentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
