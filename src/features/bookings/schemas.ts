import { z } from 'zod';

// 'self' o el uuid de un dependiente propio — la validación de que el
// dependiente pertenece de verdad al usuario ocurre en book_class_session
// (NOT_YOUR_DEPENDENT), este esquema solo comprueba que se ha elegido algo.
export const bookingBeneficiarySchema = z.object({
  beneficiary: z.string().min(1, 'Selecciona para quién es la reserva'),
});

export type BookingBeneficiaryFormValues = z.infer<typeof bookingBeneficiarySchema>;
