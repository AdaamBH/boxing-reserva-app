import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClassTemplate } from '@/features/admin/api/adminClassesApi';
import type { ClassTemplateFormValues } from '@/features/admin/schemas';

export function useUpdateClassTemplate(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClassTemplateFormValues) => updateClassTemplate(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-templates'] });
    },
  });
}
