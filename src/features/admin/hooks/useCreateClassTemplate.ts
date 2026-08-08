import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClassTemplate } from '@/features/admin/api/adminClassesApi';
import type { ClassTemplateFormValues } from '@/features/admin/schemas';

export function useCreateClassTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClassTemplateFormValues) => createClassTemplate(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-templates'] });
    },
  });
}
