import { createSupabaseAdminClient } from '../_shared/supabaseAdmin.ts';
import { resolveRecipientEmail } from '../_shared/recipient.ts';
import { sendEmail } from '../_shared/resend.ts';
import { formatSpanishDate, formatTime } from '../_shared/formatDate.ts';

// Invocada por el cliente que canceló su reserva, justo cuando
// cancel_booking devuelve promoted_booking_id — no la invoca la persona
// promocionada (puede no tener ninguna pestaña abierta en ese momento),
// sino quien liberó la plaza (AI/DECISIONS.md).
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
      .eq('estado', 'confirmada')
      .single();

    if (error || !booking) {
      console.error(
        'send_waitlist_promotion_email: reserva promocionada no encontrada',
        error,
      );
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
      subject: '¡Has entrado en la clase!',
      html: `
        <p>Se ha liberado una plaza y has entrado en <strong>${session.nombre}</strong> el ${formatSpanishDate(session.fecha)} a las ${formatTime(session.hora_inicio)}.</p>
        <p>Puedes ver los detalles y cancelar si no puedes asistir desde "Mis reservas" en la app.</p>
      `,
    });

    return new Response(JSON.stringify({ sent: true }), { status: 200 });
  } catch (error) {
    console.error('send_waitlist_promotion_email:', error);
    return new Response(JSON.stringify({ sent: false }), { status: 200 });
  }
});
