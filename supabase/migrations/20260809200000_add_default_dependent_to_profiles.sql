-- Preferencia "reservar siempre para este dependiente" (Ajustes). Un padre/
-- madre que reserva casi siempre para el mismo hijo/a no debería tener que
-- elegirlo en cada reserva — ver AI/DECISIONS.md.
--
-- NULL = reservar para uno mismo (valor por defecto, sin cambios de
-- comportamiento para nadie que no toque este ajuste). `on delete set null`
-- a propósito: si se borra el dependiente favorito, el usuario vuelve a
-- reservar para sí mismo en vez de que la fila de profiles quede rota o el
-- borrado del dependiente falle por la FK.
--
-- No hace falta una política de RLS nueva: "update_own_profile" (creada en
-- 20260718120000) ya cubre cualquier columna de la propia fila, y
-- book_class_session ya valida NOT_YOUR_DEPENDENT en el momento de reservar
-- — un valor inválido aquí simplemente fallaría ahí, no es una vía de
-- escalada nueva.
alter table public.profiles
  add column default_dependent_id uuid references public.dependents (id) on delete set null;
