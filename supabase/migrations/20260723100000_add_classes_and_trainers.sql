-- Necesaria para la función programada de generación de sesiones, más
-- abajo. Ya confirmado disponible en el plan gratuito de este proyecto
-- (verificado en vivo antes de escribir esta migración, no asumido).
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  bio text,
  foto_url text,
  especialidad text,
  activo boolean not null default true
);

alter table public.trainers enable row level security;

create policy "trainers_select_authenticated"
  on public.trainers for select
  to authenticated
  using (true);

create policy "trainers_all_admin"
  on public.trainers for all
  using (public.is_admin());

create table public.class_templates (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  -- 0 = domingo, igual que extract(dow from ...) en Postgres y
  -- Date.getDay() en JavaScript — misma convención en los dos lados,
  -- a propósito, para no tener que traducir nunca entre ellos.
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio),
  nivel text not null check (nivel in ('principiante', 'intermedio', 'avanzado')),
  trainer_id uuid not null references public.trainers(id),
  aforo_maximo int not null check (aforo_maximo > 0),
  activo boolean not null default true
);

alter table public.class_templates enable row level security;

create policy "class_templates_select_authenticated"
  on public.class_templates for select
  to authenticated
  using (true);

create policy "class_templates_all_admin"
  on public.class_templates for all
  using (public.is_admin());

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: null = sesión suelta creada a mano por el admin, sin
  -- plantilla detrás (DATABASE.md).
  template_id uuid references public.class_templates(id),
  nombre text not null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio),
  nivel text not null check (nivel in ('principiante', 'intermedio', 'avanzado')),
  trainer_id uuid not null references public.trainers(id),
  aforo_maximo int not null check (aforo_maximo > 0),
  estado text not null default 'programada' check (estado in ('programada', 'cancelada')),
  created_at timestamptz not null default now(),
  -- Con template_id NULL (sesiones sueltas), Postgres nunca considera dos
  -- NULL "iguales" a efectos de este unique — así que esto solo impide
  -- duplicados entre sesiones generadas desde la misma plantilla el mismo
  -- día, que es justo lo que debe impedir; varias sesiones sueltas el
  -- mismo día siguen permitidas.
  constraint class_sessions_template_fecha_unique unique (template_id, fecha)
);

alter table public.class_sessions enable row level security;

create policy "class_sessions_select_authenticated"
  on public.class_sessions for select
  to authenticated
  using (true);

create policy "class_sessions_all_admin"
  on public.class_sessions for all
  using (public.is_admin());

-- La consulta más frecuente será "sesiones futuras no canceladas"
-- (DATABASE.md) — este índice existe desde el día 1 por ese motivo.
create index class_sessions_fecha_estado_idx on public.class_sessions (fecha, estado);

-- Genera las próximas 4 semanas de sesiones a partir de las plantillas
-- activas. Recorre día a día en vez de una consulta de conjuntos más
-- "elegante" a propósito: con el volumen de un único gimnasio (unas
-- pocas plantillas), un bucle es tan rápido como cualquier alternativa y
-- mucho más fácil de leer y depurar — KISS, no se optimiza para una
-- escala que este proyecto no va a tener (PROJECT_CONTEXT.md).
create or replace function public.generate_class_sessions()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_horizon_days constant int := 27; -- hoy + 27 días = ventana de 4 semanas
  v_template record;
  v_target_date date;
  v_day_offset int;
begin
  for v_template in
    select * from public.class_templates where activo = true
  loop
    for v_day_offset in 0..v_horizon_days loop
      v_target_date := current_date + v_day_offset;

      if extract(dow from v_target_date) = v_template.dia_semana then
        insert into public.class_sessions (
          template_id, fecha, hora_inicio, hora_fin, nivel, trainer_id, aforo_maximo, estado, nombre
        )
        values (
          v_template.id, v_target_date, v_template.hora_inicio, v_template.hora_fin,
          v_template.nivel, v_template.trainer_id, v_template.aforo_maximo, 'programada', v_template.nombre
        )
        -- Reintentar en una fecha ya generada no debe pisar cambios que
        -- ese día concreto ya tenga (por ejemplo, una cancelación) — por
        -- eso "do nothing", no "do update". Editar una plantilla afecta a
        -- generaciones futuras, nunca reescribe sesiones ya generadas.
        on conflict (template_id, fecha) do nothing;
      end if;
    end loop;
  end loop;
end;
$$;

-- Diaria, hora de bajo tráfico (pg_cron usa UTC; 03:00 UTC ≈ 04:00-05:00
-- en España según horario de verano/invierno). Al ejecutarse cada día en
-- vez de cada semana, la ventana de 4 semanas se desliza sola sin acumular
-- trabajo pendiente.
select cron.schedule(
  'generate-class-sessions-daily',
  '0 3 * * *',
  $$select public.generate_class_sessions();$$
);