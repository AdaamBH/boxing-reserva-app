-- Marca de tiempo de cuando el padre/madre/tutor dio su consentimiento
-- explícito (LOPDGDD art. 7, SECURITY.md). Nullable y SIN valor por
-- defecto a propósito: con "default now()", cualquier inserción —
-- incluida una futura herramienta de admin que no pase por el formulario
-- de consentimiento — rellenaría esto igual, aparentando un
-- consentimiento que nunca se prestó. Solo dependentsApi.ts, que ya ha
-- comprobado el checkbox vía Zod, debe escribir aquí.
alter table public.dependents
  add column consent_given_at timestamptz;

alter table public.dependents
  add constraint dependents_relacion_check
  check (relacion in ('madre', 'padre', 'tutor_legal'));