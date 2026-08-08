-- Fase 5 (emails transaccionales): cancel_booking necesita devolver QUIÉN
-- ha sido promocionado, no solo si alguien lo ha sido, para que el email
-- de "has entrado en la clase" se pueda enviar a la persona correcta sin
-- que el frontend tenga que adivinarlo con una consulta aparte (ver
-- AI/DECISIONS.md, "Envío de emails: Edge Function invocada por el
-- cliente, no trigger de base de datos").
--
-- `create or replace function` no permite cambiar la forma de un
-- `returns table (...)` existente — hay que borrarla y recrearla.
drop function if exists public.cancel_booking(uuid);

create or replace function public.cancel_booking(p_booking_id uuid)
returns table (promoted boolean, promoted_booking_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_session record;
  v_next_waitlist record;
  v_is_admin boolean := public.is_admin();
  v_promoted_booking_id uuid;
begin
  select id, session_id, user_id, estado
    into v_booking
    from public.bookings
    where id = p_booking_id
    for update;

  if not found then
    raise exception using errcode = 'BK001', message = 'BOOKING_NOT_FOUND';
  end if;

  if not v_is_admin and v_booking.user_id <> auth.uid() then
    raise exception using errcode = 'BK001', message = 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.estado = 'cancelada' then
    raise exception using errcode = 'BK001', message = 'ALREADY_CANCELLED';
  end if;

  select id, aforo_maximo, fecha, hora_inicio
    into v_session
    from public.class_sessions
    where id = v_booking.session_id
    for update;

  if not v_is_admin
     and (v_session.fecha + v_session.hora_inicio) at time zone 'Europe/Madrid' - now()
         <= interval '1 hour'
  then
    raise exception using errcode = 'BK001', message = 'CANCELLATION_TOO_LATE';
  end if;

  update public.bookings
    set estado = 'cancelada', cancelled_at = now()
    where id = p_booking_id;

  select id, session_id, user_id, dependent_id
    into v_next_waitlist
    from public.waitlist_entries
    where session_id = v_booking.session_id
    order by created_at asc
    limit 1
    for update;

  if found then
    insert into public.bookings (session_id, user_id, dependent_id, estado)
      values (v_next_waitlist.session_id, v_next_waitlist.user_id, v_next_waitlist.dependent_id, 'confirmada')
      returning id into v_promoted_booking_id;
    delete from public.waitlist_entries where id = v_next_waitlist.id;
    return query select true, v_promoted_booking_id;
  else
    return query select false, null::uuid;
  end if;
end;
$$;

comment on function public.cancel_booking(uuid) is
  'Cancela una reserva propia (o cualquiera, si admin) y promociona atómicamente la entrada más antigua de la lista de espera, si existe. Devuelve el id de la reserva promocionada para poder notificarla por email.';

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;
