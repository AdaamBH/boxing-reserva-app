import { createSupabaseAdminClient } from '../_shared/supabaseAdmin.ts';
import { resolveRecipientEmail } from '../_shared/recipient.ts';
import { sendEmail } from '../_shared/resend.ts';
import { formatSpanishDate, formatTime } from '../_shared/formatDate.ts';

// Invocada por el cliente justo después de que cancel_booking confirme la
// cancelación (AI/DECISIONS.md) — nunca antes, y su fallo nunca deshace ni
// oculta el hecho de que la reserva ya está cancelada en base de datos.
Deno.serve(async (req: Request) => {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Falta bookingId.' }), { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('user_id, dependent_id, session:class_sessions(nombre, fecha, hora_inicio)')
      .eq('id', bookingId)
      .eq('estado', 'cancelada')
      .single();

    if (error || !booking) {
      console.error('send_cancellation_email: reserva cancelada no encontrada', error);
      return new Response(JSON.stringify({ sent: false }), { status: 200 });
    }

    const to = await resolveRecipientEmail(supabaseAdmin, {
      userId: booking.user_id as string,
      dependentId: booking.dependent_id as string | null,
    });

    const session = booking.session as unknown as {
      nombre: string;
      fecha: string;
      hora_inicio: string;
    };

    await sendEmail({
      to,
      subject: 'Reserva cancelada',
      html: `
        <p>Tu reserva para <strong>${session.nombre}</strong> el ${formatSpanishDate(session.fecha)} a las ${formatTime(session.hora_inicio)} se ha cancelado correctamente.</p>
        <p>Puedes reservar otra plaza cuando quieras desde la app.</p>
      `,
    });

    return new Response(JSON.stringify({ sent: true }), { status: 200 });
  } catch (error) {
    console.error('send_cancellation_email:', error);
    return new Response(JSON.stringify({ sent: false }), { status: 200 });
  }
});
