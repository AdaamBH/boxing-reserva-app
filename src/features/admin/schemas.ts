import { z } from 'zod';

export const NIVELES = ['principiante', 'intermedio', 'avanzado'] as const;

const horarioValido = <T extends { horaInicio: string; horaFin: string }>(values: T) =>
  values.horaFin > values.horaInicio;

export const classTemplateSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    diaSemana: z.coerce.number().int().min(0).max(6),
    horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
    horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
    nivel: z.enum(NIVELES, { message: 'Selecciona un nivel' }),
    trainerId: z.string().min(1, 'Selecciona un entrenador'),
    aforoMaximo: z.coerce.number().int().min(1, 'El aforo debe ser mayor que 0'),
  })
  .refine(horarioValido, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['horaFin'],
  });

// Dos tipos, no uno: `z.coerce.number()` acepta un string en la entrada
// (lo que de verdad produce un <input>/<select> nativo) pero devuelve un
// number a la salida. React Hook Form necesita distinguir ambos —
// `Input` para `register`/`defaultValues`, `Values` (salida) para lo que
// recibe `onSubmit` — o el tipado de `useForm` no cuadra con
// `exactOptionalPropertyTypes` activado (ver CODE_STYLE.md).
export type ClassTemplateFormInput = z.input<typeof classTemplateSchema>;
export type ClassTemplateFormValues = z.output<typeof classTemplateSchema>;

export const oneOffClassSessionSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    fecha: z.string().min(1, 'La fecha es obligatoria'),
    horaInicio: z.string().min(1, 'La hora de inicio es obligatoria'),
    horaFin: z.string().min(1, 'La hora de fin es obligatoria'),
    nivel: z.enum(NIVELES, { message: 'Selecciona un nivel' }),
    trainerId: z.string().min(1, 'Selecciona un entrenador'),
    aforoMaximo: z.coerce.number().int().min(1, 'El aforo debe ser mayor que 0'),
  })
  .refine(horarioValido, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['horaFin'],
  });

export type OneOffClassSessionFormInput = z.input<typeof oneOffClassSessionSchema>;
export type OneOffClassSessionFormValues = z.output<typeof oneOffClassSessionSchema>;
