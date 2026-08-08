-- Lista de clase: quién está dentro (confirmados) y quién está en lista de
-- espera para una sesión concreta, cada una ordenada de quien reservó
-- antes a quien reservó después. Visible para cualquier usuario
-- autenticado (decisión del cliente, ver AI/DECISIONS.md) — pero solo se
-- expone "Nombre I." (nombre + inicial del apellido), nunca el apellido
-- completo ni ningún otro dato de la reserva, ni siquiera para menores;
-- mismo formato para todos, sin distinción.
--
-- SECURITY DEFINER a propósito: la política de RLS de bookings/
-- waitlist_entries sigue restringida a "mis propias reservas" (no se
-- toca) — esta función es la única vía por la que un usuario ve datos de
-- reservas de otros, y solo expone la proyección mínima decidida
-- (nombre truncado + orden), nunca la fila completa.
create or replace function public.get_session_roster(p_session_id uuid)
returns table (estado text, display_name text, orden int)
language sql
security definer
set search_path = public
stable
as $$
  -- Postgres no deja usar expresiones en el ORDER BY de un UNION
  -- directamente (solo nombres de columna) — de ahí el envoltorio.
  select roster.estado, roster.display_name, roster.orden
  from (
    select
      'confirmada' as estado,
      case
        when d.id is not null then d.nombre || ' ' || left(d.apellidos, 1) || '.'
        else p.nombre || ' ' || left(p.apellidos, 1) || '.'
      end as display_name,
      (row_number() over (order by b.created_at asc))::int as orden
    from public.bookings b
    left join public.dependents d on d.id = b.dependent_id
    left join public.profiles p on p.id = b.user_id and b.dependent_id is null
    where b.session_id = p_session_id and b.estado = 'confirmada'

    union all

    select
      'en_espera' as estado,
      case
        when d.id is not null then d.nombre || ' ' || left(d.apellidos, 1) || '.'
        else p.nombre || ' ' || left(p.apellidos, 1) || '.'
      end as display_name,
      (row_number() over (order by w.created_at asc))::int as orden
    from public.waitlist_entries w
    left join public.dependents d on d.id = w.dependent_id
    left join public.profiles p on p.id = w.user_id and w.dependent_id is null
    where w.session_id = p_session_id
  ) as roster
  -- 'confirmada' (dentro de la clase) siempre antes que 'en_espera',
  -- explícito y no por casualidad alfabética.
  order by (roster.estado <> 'confirmada'), roster.orden asc;
$$;

comment on function public.get_session_roster(uuid) is
  'Lista de confirmados y lista de espera de una sesión, ordenadas por antigüedad de reserva, con el nombre truncado a "Nombre I." — nunca expone la fila completa de bookings/waitlist_entries.';

revoke all on function public.get_session_roster(uuid) from public;
grant execute on function public.get_session_roster(uuid) to authenticated;
