-- Fase 3 + Fase 4: reservas, aforo, cancelaciones y promoción automática.
-- Ver AI/DATABASE.md (esquema y el problema del aforo) y AI/DECISIONS.md
-- (convención de errores de negocio en estas funciones: SQLSTATE 'BK001').

-- ============================================================
-- Tabla: bookings
-- ============================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id),
  -- Quién ha hecho la acción (siempre una cuenta real, nunca el menor).
  user_id uuid not null references public.profiles (id),
  -- Para quién es la plaza. NULL = para el propio user_id.
  dependent_id uuid references public.dependents (id),
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

comment on table public.bookings is
  'Reservas confirmadas o canceladas. Solo se escribe desde book_class_session/cancel_booking (SECURITY DEFINER) — nunca INSERT/UPDATE directo desde el cliente, por eso no hay política de escritura para authenticated.';

create index bookings_session_id_estado_idx on public.bookings (session_id, estado);
create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_dependent_id_idx on public.bookings (dependent_id);

-- Defensa en profundidad contra reservas duplicadas: la comprobación real
-- vive dentro de book_class_session (ya tiene el lock de la sesión, así
-- que es segura frente a carreras sin necesitar este índice) — esto es
-- solo una red de seguridad ante un futuro bypass o un bug en la función.
-- coalesce(...) porque dos dependent_id NULL nunca se consideran "iguales"
-- en un índice único normal, lo que dejaría sin proteger las reservas
-- hechas para uno mismo.
create unique index bookings_unique_active_idx
  on public.bookings (session_id, user_id, coalesce(dependent_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where estado = 'confirmada';

-- ============================================================
-- Tabla: waitlist_entries
-- ============================================================
create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id),
  user_id uuid not null references public.profiles (id),
  dependent_id uuid references public.dependents (id),
  -- Define el orden FIFO de promoción al cancelarse una plaza.
  created_at timestamptz not null default now()
);

comment on table public.waitlist_entries is
  'Lista de espera FIFO por sesión. Solo se escribe desde book_class_session/cancel_booking/leave_waitlist — nunca INSERT/UPDATE/DELETE directo desde el cliente.';

create index waitlist_entries_session_id_created_at_idx
  on public.waitlist_entries (session_id, created_at);

create unique index waitlist_entries_unique_idx
  on public.waitlist_entries (session_id, user_id, coalesce(dependent_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.bookings enable row level security;
alter table public.waitlist_entries enable row level security;

-- Solo lectura para authenticated: la propia + las de los dependientes
-- propios; admin ve/edita todo. Deliberadamente NO existe política de
-- INSERT/UPDATE/DELETE para authenticated en ninguna de las dos tablas —
-- toda escritura pasa por las funciones SECURITY DEFINER de abajo, que
-- se saltan RLS como su propietario. Esto es lo que hace imposible saltarse
-- el control de aforo con un INSERT directo (AI/DATABASE.md).
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (
    user_id = auth.uid()
    or dependent_id in (select id from public.dependents where parent_user_id = auth.uid())
  );

create policy "bookings_all_admin"
  on public.bookings for all
  using (public.is_admin());

create policy "waitlist_entries_select_own"
  on public.waitlist_entries for select
  to authenticated
  using (
    user_id = auth.uid()
    or dependent_id in (select id from public.dependents where parent_user_id = auth.uid())
  );

create policy "waitlist_entries_all_admin"
  on public.waitlist_entries for all
  using (public.is_admin());

-- ============================================================
-- Función: book_class_session
-- ============================================================
-- La pieza más delicada del proyecto (AI/DATABASE.md). El "for update"
-- bloquea la fila de class_sessions durante toda la transacción: cualquier
-- otra llamada a book_class_session/cancel_booking para la MISMA sesión
-- espera aquí en cola, en vez de correr en paralelo — así "comprobar aforo
-- y luego insertar" pasa a ser una sola operación indivisible.
--
-- Errores de negocio: se lanzan con errcode = 'BK001' y el código estable
-- como MESSAGE (ver AI/DECISIONS.md). El frontend distingue
-- error.code === 'BK001' (resultado de negocio esperado, se traduce a
-- {success:false,error:{code,message}}) de cualquier otro error (fallo de
-- infraestructura real, se relanza como excepción genérica).
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
  'Reserva atómica con control de aforo. El FOR UPDATE sobre class_sessions es la garantía de que dos reservas simultáneas para la última plaza nunca ganan las dos (AI/DATABASE.md).';

revoke all on function public.book_class_session(uuid, uuid) from public;
grant execute on function public.book_class_session(uuid, uuid) to authenticated;

-- ============================================================
-- Función: cancel_booking
-- ============================================================
-- Mismo principio que book_class_session: cancelar y promocionar a quien
-- toque de la lista de espera ocurre en una sola función atómica, nunca en
-- dos pasos separados desde el cliente (AI/DATABASE.md).
--
-- Orden de los locks: primero la fila de bookings propia (nunca disputada
-- por otro usuario), después la fila de class_sessions (compartida). Dos
-- cancelaciones concurrentes sobre la misma sesión bloquean cada una una
-- fila de bookings DISTINTA antes de encolarse en el lock de la sesión —
-- una cola, nunca un ciclo, así que no hay interbloqueo entre esta función
-- y book_class_session.
create or replace function public.cancel_booking(p_booking_id uuid)
returns table (promoted boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking record;
  v_session record;
  v_next_waitlist record;
  v_is_admin boolean := public.is_admin();
begin
  select id, session_id, user_id, estado
    into v_booking
    from public.bookings
    where id = p_booking_id
    for update;

  if not found then
    raise exception using errcode = 'BK001', message = 'BOOKING_NOT_FOUND';
  end if;

  -- Mismo código para "no existe" y "no es tuya" a propósito: un código
  -- distinto de "prohibido" permitiría a alguien averiguar qué IDs de
  -- reserva de otro usuario existen simplemente observando la diferencia.
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

  -- Admin puede cancelar cualquier reserva saltándose el límite de 1h
  -- (necesidad operativa: el gimnasio cierra antes de tiempo, entrenador
  -- de baja, etc. — ver AI/DECISIONS.md).
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
      values (v_next_waitlist.session_id, v_next_waitlist.user_id, v_next_waitlist.dependent_id, 'confirmada');
    delete from public.waitlist_entries where id = v_next_waitlist.id;
    return query select true;
  else
    return query select false;
  end if;
end;
$$;

comment on function public.cancel_booking(uuid) is
  'Cancela una reserva propia (o cualquiera, si admin) y promociona atómicamente la entrada más antigua de la lista de espera, si existe.';

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- ============================================================
-- Función: leave_waitlist
-- ============================================================
-- A diferencia de las dos anteriores, no es crítica en concurrencia (borrar
-- la propia entrada no compite por ningún recurso compartido) — existe
-- para que "mis reservas" no sea un callejón sin salida para quien está en
-- lista de espera y ya no quiere seguir en ella.
create or replace function public.leave_waitlist(p_waitlist_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.waitlist_entries
    where id = p_waitlist_entry_id
      and (user_id = auth.uid() or public.is_admin())
  ) then
    raise exception using errcode = 'BK001', message = 'BOOKING_NOT_FOUND';
  end if;

  delete from public.waitlist_entries where id = p_waitlist_entry_id;
end;
$$;

comment on function public.leave_waitlist(uuid) is
  'Sale de la lista de espera de una entrada propia (o cualquiera, si admin).';

revoke all on function public.leave_waitlist(uuid) from public;
grant execute on function public.leave_waitlist(uuid) to authenticated;

-- ============================================================
-- Función: get_session_occupancy
-- ============================================================
-- Por qué existe: la política de RLS de bookings solo deja ver a cada
-- usuario sus propias reservas (y las de sus dependientes) — así que un
-- alumno no puede calcular "plazas libres" contando filas de bookings
-- desde el cliente, porque nunca ve las reservas de los demás. Esta
-- función SECURITY DEFINER solo expone un recuento agregado (sin datos
-- personales de quién ha reservado), mismo patrón que is_admin().
create or replace function public.get_session_occupancy(p_session_ids uuid[])
returns table (session_id uuid, ocupadas bigint)
language sql
security definer
set search_path = public
stable
as $$
  select session_id, count(*) as ocupadas
  from public.bookings
  where session_id = any(p_session_ids) and estado = 'confirmada'
  group by session_id;
$$;

comment on function public.get_session_occupancy(uuid[]) is
  'Devuelve el número de reservas confirmadas por sesión, sin exponer de quién son — permite calcular plazas libres sin saltarse RLS de bookings.';

revoke all on function public.get_session_occupancy(uuid[]) from public;
grant execute on function public.get_session_occupancy(uuid[]) to authenticated;
