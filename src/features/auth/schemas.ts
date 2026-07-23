import { z } from 'zod';

const MIN_ADULT_AGE = 18;

// Quien REGISTRA una cuenta tiene que ser mayor de edad: los menores no
// tienen cuenta propia, se gestionan como dependientes desde la cuenta de
// su padre/madre (ver SECURITY.md, "Menores de edad"). Esta regla no
// estaba escrita explícitamente en ningún documento — es una consecuencia
// directa del modelo ya acordado, así que se añade aquí y se deja anotada
// en DECISIONS.md en vez de dejarla implícita solo en el código.
function isAtLeastAge(dateString: string, age: number): boolean {
  const birthDate = new Date(dateString);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }
  const today = new Date();
  // Medianoche UTC del mismo día de calendario que vive el usuario en
  // España (los componentes de fecha se leen en local — eso es "hoy" tal
  // y como lo ve quien rellena el formulario), pero anclada a UTC para
  // que coincida con cómo Date() interpreta "AAAA-MM-DD": como medianoche
  // UTC, no local. Mezclar las dos anclas (lo que hacía la versión
  // anterior) desplaza el corte por el huso horario local — hasta 2 horas
  // en verano — y rechaza por error a quien cumple 18 justo hoy.
  const ageThreshold = new Date(
    Date.UTC(today.getFullYear() - age, today.getMonth(), today.getDate()),
  );
  return birthDate <= ageThreshold;
}

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .email('Introduce un email válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    passwordConfirmation: z.string().min(1, 'Confirma tu contraseña'),
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios').max(150),
    telefono: z
      .string()
      .trim()
      .min(1, 'El teléfono es obligatorio')
      .refine((value) => value.replace(/[^\d]/g, '').length >= 9, {
        message: 'Introduce un teléfono válido (mínimo 9 dígitos)',
      }),
    fechaNacimiento: z
      .string()
      .min(1, 'La fecha de nacimiento es obligatoria')
      .refine((value) => isAtLeastAge(value, MIN_ADULT_AGE), {
        message:
          'Debes ser mayor de edad para registrarte. Para inscribir a un/a menor, hazlo después desde tu propia cuenta.',
      }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Introduce un email válido'),
});

export type PasswordResetRequestFormValues = z.infer<typeof passwordResetRequestSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    passwordConfirmation: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation'],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
