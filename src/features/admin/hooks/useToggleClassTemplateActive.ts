import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setClassTemplateActive } from '@/features/admin/api/adminClassesApi';

interface ToggleClassTemplateActiveVars {
  id: string;
  activo: boolean;
}

export function useToggleClassTemplateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }: ToggleClassTemplateActiveVars) =>
      setClassTemplateActive(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-templates'] });
    },
  });
}
