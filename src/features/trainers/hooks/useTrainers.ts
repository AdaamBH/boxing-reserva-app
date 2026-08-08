import { useQuery } from '@tanstack/react-query';
import { fetchActiveTrainers } from '@/features/trainers/api/trainersApi';

export function useTrainers() {
  return useQuery({ queryKey: ['trainers', 'active'], queryFn: fetchActiveTrainers });
}
