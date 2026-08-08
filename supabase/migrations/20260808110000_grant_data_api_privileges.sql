-- Descubierto al escribir los primeros tests de integración de Fase 3
-- (los primeros en esta base de código que hablan con un Supabase local
-- real en vez de con mocks): las versiones recientes de la CLI de
-- Supabase han cambiado el comportamiento por defecto — las tablas nuevas
-- del esquema public YA NO se exponen automáticamente a los roles de la
-- Data API (anon/authenticated/service_role) sin un GRANT explícito
-- (`api.auto_expose_new_tables` en supabase/config.toml, ahora false por
-- defecto, "matching the new cloud default"). Ninguna migración anterior
-- (Fase 0-2) lo hacía porque nunca hizo falta verificarlo en local antes
-- de ahora — RLS sin el GRANT de base no da acceso a nada, deniega todo
-- directamente ("permission denied for table x", ni siquiera llega a
-- evaluarse la política). Ver AI/DECISIONS.md.
--
-- Este GRANT es deliberadamente amplio (SELECT/INSERT/UPDATE/DELETE) en
-- las tablas donde existe alguna política para ese rol — el filtrado fino
-- de qué fila/acción concreta se permite lo sigue haciendo RLS, igual que
-- en el resto del proyecto. Conceder el permiso de base sin política no
-- abre nada: RLS deniega por defecto cualquier acción sin una política
-- permisiva que la cubra.
grant select, update on public.profiles to authenticated, service_role;
grant insert, delete on public.profiles to service_role;

grant select, insert, update, delete on public.dependents to authenticated, service_role;
grant select, insert, update, delete on public.trainers to authenticated, service_role;
grant select, insert, update, delete on public.class_templates to authenticated, service_role;
grant select, insert, update, delete on public.class_sessions to authenticated, service_role;
grant select, insert, update, delete on public.bookings to authenticated, service_role;
grant select, insert, update, delete on public.waitlist_entries to authenticated, service_role;
