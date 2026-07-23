-- Fase 1: autenticación y perfiles.
-- Ver AI/DATABASE.md (esquema y RLS) y AI/SECURITY.md (autenticación y menores).

-- ============================================================
-- Tabla: profiles
-- ============================================================
-- Espejo público de auth.users con los datos que la aplicación necesita
-- mostrar/gestionar. auth.users vive en el esquema `auth`, gestionado por
-- Supabase Auth, y no expone columnas propias del negocio (nombre, rol...).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'alumno' check (role in ('alumno', 'admin')),
  nombre text not null,
  apellidos text not null,
  telefono text,
  fecha_nacimiento date,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Espejo de auth.users con los datos de perfil de la aplicación. La fila se crea automáticamente al registrarse (ver trigger on_auth_user_created).';

-- nombre/apellidos son la identidad mínima imprescindible: not null.
-- telefono/fecha_nacimiento se dejan nullable a nivel de base de datos
-- (invariante real del dominio) aunque el formulario de registro los pida
-- como obligatorios (política de la aplicación, ver Zod en el frontend) —
-- son cosas distintas y no tiene que coincidir una con la otra.

-- ============================================================
-- Tabla: dependents
-- ============================================================
-- Hijos/as menores gestionados desde la cuenta de un padre/madre.
-- Ver SECURITY.md ("Menores de edad") y DECISIONS.md
-- ("Modelo de datos para menores de edad").
create table public.dependents (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null,
  apellidos text not null,
  fecha_nacimiento date not null,
  relacion text not null,
  created_at timestamptz not null default now()
);

create index dependents_parent_user_id_idx on public.dependents (parent_user_id);

comment on table public.dependents is
  'Menores gestionados desde la cuenta de un padre/madre/tutor. No tienen cuenta propia (ver SECURITY.md, LOPDGDD art. 7).';

-- ============================================================
-- Función auxiliar: is_admin()
-- ============================================================
-- Por qué existe: una política de RLS en `profiles` que comprobara el rol
-- con "select ... from profiles where id = auth.uid()" directamente
-- dispararía de nuevo las políticas de RLS de profiles para esa misma
-- subconsulta — Postgres puede tratarlo como recursión de políticas.
-- La solución estándar de Supabase es una función SECURITY DEFINER: se
-- ejecuta con los permisos de quien la creó (no del usuario que llama),
-- así que la subconsulta interna se salta RLS deliberadamente sólo para
-- esta comprobación puntual y controlada.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'Comprueba si el usuario autenticado actual es admin. SECURITY DEFINER a propósito: evita la recursión de RLS al consultar profiles desde dentro de una política de profiles.';

-- ============================================================
-- Trigger: crear el perfil automáticamente al registrarse
-- ============================================================
-- Sin esto, tras supabase.auth.signUp() existiría una fila en auth.users
-- pero ninguna en profiles, y toda la app se rompería (RLS de profiles no
-- tendría fila que devolver). Los campos vienen de raw_user_meta_data,
-- que el frontend rellena en `options.data` al llamar a signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellidos, telefono, fecha_nacimiento)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellidos', ''),
    new.raw_user_meta_data ->> 'telefono',
    nullif(new.raw_user_meta_data ->> 'fecha_nacimiento', '')::date
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger: impedir que un usuario se autopromocione a admin
-- ============================================================
-- El problema clásico de RLS: una política de UPDATE que compruebe
-- "id = auth.uid()" autoriza la fila completa, columna por columna —
-- incluida `role`. Sin esta guarda, cualquier alumno podría hacer
-- `update profiles set role = 'admin' where id = auth.uid()` y la
-- política de abajo lo dejaría pasar sin más, porque RLS controla QUÉ
-- FILAS se pueden tocar, no QUÉ COLUMNAS dentro de una fila permitida.
-- Este trigger es la barrera real contra la escalada de privilegios.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'No tienes permiso para cambiar el rol de un perfil.';
  end if;
  return new;
end;
$$;

create trigger enforce_role_change_admin_only
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.dependents enable row level security;

-- profiles: cada usuario ve/edita su propia fila; admin ve/edita todas.
-- (El propio contenido de `role` queda protegido por el trigger de arriba,
-- no por esta política — ver comentario del trigger.)
create policy "select_own_profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "update_own_profile"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Nota deliberada: no existe política de INSERT para el cliente en
-- `profiles`. La única vía de creación es el trigger `handle_new_user`
-- (que corre como SECURITY DEFINER y por tanto no pasa por RLS). Esto
-- cierra otra vía de escalada: nadie puede insertarse directamente un
-- perfil con role = 'admin' desde el cliente.

-- dependents: el padre/madre gestiona los suyos; admin gestiona todos.
-- El WITH CHECK de insert/update ya impide que un no-admin reasigne un
-- dependiente a otro parent_user_id que no sea el suyo propio.
create policy "select_own_dependents"
  on public.dependents for select
  using (parent_user_id = auth.uid() or public.is_admin());

create policy "insert_own_dependents"
  on public.dependents for insert
  with check (parent_user_id = auth.uid() or public.is_admin());

create policy "update_own_dependents"
  on public.dependents for update
  using (parent_user_id = auth.uid() or public.is_admin())
  with check (parent_user_id = auth.uid() or public.is_admin());

create policy "delete_own_dependents"
  on public.dependents for delete
  using (parent_user_id = auth.uid() or public.is_admin());
