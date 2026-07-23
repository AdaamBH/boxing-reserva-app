import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDependent } from '@/features/dependents/api/dependentsApi';
import type { AddDependentFormValues } from '@/features/dependents/schemas';

export function useAddDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    // Envuelto a propósito, no `mutationFn: addDependent` directo:
    // TanStack Query llama a mutationFn con un segundo argumento interno
    // (contexto de la mutación) que no forma parte del contrato de
    // ninguna función de `api/` — envolverlo evita que ese detalle se
    // filtre hacia código que no lo espera (y que un test lo detecte
    // como si fuera un cambio real de comportamiento).
    mutationFn: (values: AddDependentFormValues) => addDependent(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependents'] });
    },
  });
}
