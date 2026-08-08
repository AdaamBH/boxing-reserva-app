import { useQuery } from '@tanstack/react-query';
import { fetchMyDependents } from '@/features/dependents/api/dependentsApi';

export function useDependents() {
  return useQuery({ queryKey: ['dependents'], queryFn: fetchMyDependents });
}
