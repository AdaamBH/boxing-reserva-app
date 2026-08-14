-- Ventana de reserva: solo se puede reservar la semana en curso y la
-- siguiente, aunque pg_cron tenga ya generadas 4 semanas de class_sessions.
--
-- Motivo (petición del cliente, ver AI/DECISIONS.md): con todo el mes
-- visible, los más rápidos reservaban de una sentada las clases de las
-- cuatro semanas y siempre acababan entrando los mismos. Abriendo semana a
-- semana el reparto de plazas es más justo.
--
-- Esto es el límite REAL. La pantalla de Reservas también lo aplica
-- (src/utils/bookingWindow.ts), pero eso es solo comodidad: una
-- comprobación en el navegador se salta llamando a la RPC a mano, así que
-- la que manda es esta. BOOKABLE_WEEKS_AHEAD (frontend) y el `+ 13` de
-- aquí tienen que cambiar a la vez.
--
-- El cálculo va en hora de Madrid, no en UTC: a las 00:30 del lunes en
-- España `now()` en UTC todavía es domingo, y la ventana se abriría un día
-- tarde para todo el gimnasio. `date_trunc('week', ...)` en Postgres ya
-- empieza en lunes (ISO), igual que getWeekStart() en el frontend.
--   lunes de esta semana + 13 días = domingo de la semana siguiente.
--
-- Se redefine la función entera porque plpgsql no permite parchear un
-- bloque suelto; el resto del cuerpo es idéntico a la versión de
-- 20260808100000, con el bloque nuevo justo detrás de SESSION_IN_PAST.
create or replace function public.book_class_session(
  p_session_id uuid,
  p_dependent_id uuid default null
)
returns text -- 'confirmada' | 'en_espera'
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
  v_ocupadas int;
  v_last_bookable_date date;
begin
  select id, aforo_maximo, estado, fecha, hora_inicio
    into v_session
    from public.class_sessions
    where id = p_session_id
    for update;

  if not found then
    raise exception using errcode = 'BK001', message = 'SESSION_NOT_FOUND';
  end if;

  if v_session.estado <> 'programada' then
    raise exception using errcode = 'BK001', message = 'SESSION_CANCELLED';
  end if;

  if (v_session.fecha + v_session.hora_inicio) at time zone 'Europe/Madrid' <= now() then
    raise exception using errcode = 'BK001', message = 'SESSION_IN_PAST';
  end if;

  v_last_bookable_date :=
    date_trunc('week', (now() at time zone 'Europe/Madrid')::date)::date + 13;

  if v_session.fecha > v_last_bookable_date then
    raise exception using errcode = 'BK001', message = 'SESSION_TOO_FAR_AHEAD';
  end if;

  if p_dependent_id is not null then
    if not exists (
      select 1 from public.dependents
      where id = p_dependent_id and parent_user_id = auth.uid()
    ) then
      raise exception using errcode = 'BK001', message = 'NOT_YOUR_DEPENDENT';
    end if;
  end if;

  if exists (
    select 1 from public.bookings
    where session_id = p_session_id and user_id = auth.uid()
      and dependent_id is not distinct from p_dependent_id and estado = 'confirmada'
  ) or exists (
    select 1 from public.waitlist_entries
    where session_id = p_session_id and user_id = auth.uid()
      and dependent_id is not distinct from p_dependent_id
  ) then
    raise exception using errcode = 'BK001', message = 'ALREADY_BOOKED';
  end if;

  select count(*) into v_ocupadas
    from public.bookings
    where session_id = p_session_id and estado = 'confirmada';

  if v_ocupadas < v_session.aforo_maximo then
    insert into public.bookings (session_id, user_id, dependent_id, estado)
      values (p_session_id, auth.uid(), p_dependent_id, 'confirmada');
    return 'confirmada';
  else
    insert into public.waitlist_entries (session_id, user_id, dependent_id)
      values (p_session_id, auth.uid(), p_dependent_id);
    return 'en_espera';
  end if;
end;
$$;

comment on function public.book_class_session(uuid, uuid) is
  'Reserva atómica con control de aforo (SELECT ... FOR UPDATE). Devuelve confirmada|en_espera. Rechaza sesiones más allá de la semana siguiente (SESSION_TOO_FAR_AHEAD).';

revoke all on function public.book_class_session(uuid, uuid) from public;
grant execute on function public.book_class_session(uuid, uuid) to authenticated;
