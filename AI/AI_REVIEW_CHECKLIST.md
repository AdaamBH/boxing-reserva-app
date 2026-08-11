# AI_REVIEW_CHECKLIST.md

Checklist a repasar literalmente, punto por punto, antes de decir que una tarea está terminada. Si algo no aplica a la tarea concreta, se marca como "N/A" explícitamente — no se omite en silencio.

## Código

- [ ] TypeScript estricto sin errores (`tsc --noEmit` limpio).
- [ ] Sin `any` sin justificar, sin `@ts-ignore` sin comentario.
- [ ] Sin `console.log` restante.
- [ ] Componentes nuevos/modificados por debajo de ~150 líneas; si no, ¿se ha dividido con sentido?
- [ ] Nombres descriptivos (nada de `data`, `temp`, `handleClick2`).
- [ ] Imports con alias `@/...`, ninguno con `../../../`.
- [ ] Sin lógica de negocio duplicada entre frontend y Edge Function que debiera compartir esquema/función.

## Seguridad (repasar `SECURITY.md`)

- [ ] Si se creó una tabla nueva: tiene política de RLS explícita (no solo "activada por defecto sin políticas", que en Supabase equivale a bloquear todo — hay que verificar que hace exactamente lo que debe, ni más ni menos).
- [ ] Si se creó una tabla nueva: tiene `GRANT` explícito para los roles de la Data API que deban alcanzarla (`authenticated`/`service_role`, ajustado a qué políticas de RLS existen para cada uno) — sin él, RLS nunca llega a evaluarse (ver `AI/DECISIONS.md`, "Descubierto: las tablas nuevas ya no se exponen a la Data API sin GRANT explícito").
- [ ] Si se tocan reservas/aforo: pasa por la función atómica correspondiente, no por un INSERT/UPDATE directo.
- [ ] Toda entrada de usuario se valida con Zod, tanto en frontend como en la Edge Function.
- [ ] Ninguna clave secreta (service role, API key de Resend) aparece en código de cliente ni se ha commiteado un `.env` real.
- [ ] Si la tarea toca datos de menores/dependientes: se ha revisado la sección correspondiente de `SECURITY.md`.

## UX / mobile-first

- [ ] Comprobado visualmente en un viewport de móvil (no solo en el monitor de escritorio del editor).
- [ ] Estados de carga y error visibles y comprensibles (no una pantalla en blanco mientras carga, no un error técnico en crudo).
- [ ] Textos de cara al usuario en español, claros, sin jerga técnica.
- [ ] Si la tarea toca rutas/navegación: probado también recargar la página en una ruta interna y el botón "atrás" del navegador, no solo navegar pulsando enlaces (ver `AI/DECISIONS.md`, 2026-08-11 — el 404 de `vercel.json` pasó desapercibido justo por no probar esto).

## Tests (ver `TESTING.md`)

- [ ] Camino feliz cubierto.
- [ ] Caso límite relevante cubierto (ejemplo: en reservas, el caso de aforo lleno / lista de espera; en cancelación, el límite de 1 hora).
- [ ] Si la tarea afecta al flujo de reserva/cancelación: existe o se ha actualizado el test E2E correspondiente.

## Documentación

- [ ] Si se ha tomado una decisión técnica no prevista en los documentos de `AI/`, se ha añadido a `DECISIONS.md`.
- [ ] Si el cambio afecta a cómo se despliega o a variables de entorno: `DEPLOYMENT.md` actualizado.

## Antes de abrir el Pull Request

- [ ] Rama con nombre descriptivo (`feature/...`, `fix/...`).
- [ ] Commits en formato Conventional Commits.
- [ ] Lint y formateo pasan sin avisos.
- [ ] Se ha revisado el propio diff de principio a fin, como si fuera el código de otra persona.
