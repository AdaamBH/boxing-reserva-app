// Prefijo `_shared` a propósito: la CLI de Supabase despliega cada
// subcarpeta de `functions/` como su propia función excepto las que
// empiezan por `_` — así este helper se puede importar desde varias
// funciones sin convertirse él mismo en un endpoint.
const RESEND_API_URL = 'https://api.resend.com/emails';

// onboarding@resend.dev: remitente de pruebas de Resend, válido sin
// verificar un dominio propio (solo entrega a la cuenta de Resend
// propietaria de la API key). Cambiar aquí cuando haya dominio propio
// verificado — ver AI/DEPLOYMENT.md, checklist de salida a producción.
const FROM_ADDRESS = 'Gimnasio de boxeo <onboarding@resend.dev>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// Lanza si el envío falla — cada función que lo usa decide si ese fallo
// debe registrarse solamente (nunca debe romper una reserva/cancelación
// ya confirmada en base de datos, ver bookingsApi.ts).
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    throw new Error('Falta la variable de entorno RESEND_API_KEY.');
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${body}`);
  }
}
