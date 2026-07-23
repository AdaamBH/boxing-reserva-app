import { z } from 'zod';

export const addDependentSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios').max(150),
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Introduce una fecha válida',
    }),
  relacion: z.enum(['madre', 'padre', 'tutor_legal'], {
    message: 'Selecciona una opción',
  }),
  consentimiento: z.literal(true, {
    message: 'Debes confirmar el consentimiento para continuar',
  }),
});

export type AddDependentFormValues = z.infer<typeof addDependentSchema>;
