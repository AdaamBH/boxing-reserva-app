import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

interface BookingRecipientInfo {
  userId: string;
  dependentId: string | null;
}

// Si la reserva es para un dependiente (menor, sin cuenta propia), el
// email va al padre/madre — nunca al menor, que no tiene forma de
// recibirlo (AI/DATABASE.md, AI/SECURITY.md).
export async function resolveRecipientEmail(
  supabaseAdmin: SupabaseClient,
  booking: BookingRecipientInfo,
): Promise<string> {
  let targetUserId = booking.userId;

  if (booking.dependentId) {
    const { data: dependent, error } = await supabaseAdmin
      .from('dependents')
      .select('parent_user_id')
      .eq('id', booking.dependentId)
      .single();

    if (error || !dependent) {
      throw new Error('No se ha podido resolver el padre/madre del dependiente.');
    }

    targetUserId = dependent.parent_user_id as string;
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

  if (error || !data.user?.email) {
    throw new Error('No se ha podido resolver el email del destinatario.');
  }

  return data.user.email;
}
