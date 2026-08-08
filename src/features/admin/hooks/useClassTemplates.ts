import { useQuery } from '@tanstack/react-query';
import { fetchClassTemplates } from '@/features/admin/api/adminClassesApi';

export function useClassTemplates() {
  return useQuery({ queryKey: ['class-templates'], queryFn: fetchClassTemplates });
}
