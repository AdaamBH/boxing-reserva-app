# DECISIONS.md

> Documento añadido a los 12 que se pidieron originalmente. Registro de decisiones técnicas relevantes a medida que el proyecto avanza — el sitio donde vive el "por qué" de las cosas para no perderlo dentro de seis meses. Cada entrada nueva se añade al final, nunca se borran ni se reescriben las anteriores (si una decisión se revierte, se añade una entrada nueva que lo explica y enlaza a la que sustituye).

Formato de cada entrada:

```
## [Fecha] Título corto de la decisión

**Contexto:** qué problema o pregunta motivó esta decisión.
**Decisión:** qué se decidió.
**Alternativas consideradas:** qué otras opciones había y por qué no se eligieron.
**Consecuencias:** qué implica esto de cara al futuro (positivo y negativo).
```

---

## [2026-07-13] Stack tecnológico inicial del proyecto

**Contexto:** Arranque del proyecto. Necesidad de elegir frontend, backend, empaquetado móvil, hosting y email transaccional para una app de gestión de un gimnasio de boxeo, con presupuesto cero, un único desarrollador sin experiencia previa, y objetivo de llegar a Google Play a medio plazo.

**Decisión:** React + Vite + TypeScript, Capacitor para empaquetado móvil, Supabase como backend, Resend para email transaccional, Vercel para hosting, TanStack Query para estado de servidor, Tailwind CSS para estilos.

**Alternativas consideradas:** Next.js (descartado por complejidad innecesaria sin necesidad real de SSR/SEO), React Native (descartado por alejarse de desarrollo web estándar y complicar tener también versión web), Firebase (descartado por no ser relacional, peor encaje con el requisito de control estricto de aforo), backend propio (descartado por ahora — reinventar auth/RLS sin necesidad todavía).

**Consecuencias:** Curva de aprendizaje más suave al mantenerse en el ecosistema web estándar. Camino de migración razonable si el proyecto escala mucho (Postgres es Postgres). Dependencia de los niveles gratuitos de Supabase/Resend/Vercel documentada en `DEPLOYMENT.md`, con puntos de revisión ya identificados.

---

## [2026-07-13] Modelo de datos para menores de edad

**Contexto:** El gimnasio tiene alumnos menores de edad que no tendrán cuenta propia; se gestionan desde la cuenta de su padre/madre.

**Decisión:** Tabla `dependents` vinculada a `parent_user_id`; las reservas guardan tanto `user_id` (quién reserva) como `dependent_id` opcional (para quién es la plaza).

**Alternativas consideradas:** Cuenta propia para el menor con permisos restringidos (descartada — contradice explícitamente lo que se pidió, y añade complejidad de autenticación sin beneficio real dado que el menor no va a usar la app directamente).

**Consecuencias:** Cumple de forma natural con el artículo 7 de la LOPDGDD (el padre/madre presta el consentimiento al dar de alta al dependiente). Cualquier funcionalidad futura que toque "quién puede reservar" tiene que contemplar ambos casos (cuenta propia vs. dependiente) desde el diseño, no como un añadido posterior.

---

## [2026-07-17] Fijar TypeScript en la serie 6.x, no en la última (7.x)

**Contexto:** Al montar el andamiaje de la Fase 0 e instalar dependencias reales, `npm install typescript@latest` resolvió TypeScript 7.0.2 (una versión mayor publicada después del corte de conocimiento del asistente). Al instalar `typescript-eslint` a continuación, npm reportó un conflicto de `peer dependency`: `typescript-eslint@8.64.0` solo declara soporte hasta `<6.1.0`. No es una suposición — es el resultado real del gestor de paquetes en el momento de escribir esto.

**Decisión:** Fijar `typescript` en `6.0.3` (la última de la serie 6.x, dentro del rango que `typescript-eslint` sí soporta oficialmente) en vez de forzar la instalación de la 7.x con `--legacy-peer-deps`.

**Alternativas consideradas:** Forzar TypeScript 7.x con `--legacy-peer-deps` (descartada — usar una combinación de versiones que el propio `typescript-eslint` no ha probado ni soporta introduce riesgo real de comportamiento inesperado en el linting con tipos, sin ningún beneficio a cambio para este proyecto).

**Consecuencias:** El proyecto arranca sobre una combinación de versiones realmente probada y soportada, no sobre la más nueva por serlo (coherente con "estabilidad y mantenibilidad antes que novedad", `PROJECT_CONTEXT.md`). Revisar este pin cuando `typescript-eslint` publique soporte oficial para TypeScript 7.x — no antes.

---

*(Siguiente entrada: la próxima decisión técnica relevante que surja durante la implementación se añade aquí, siguiendo el mismo formato.)*


## [2026-07-23] Generación de `class_sessions`: `pg_cron` + función Postgres, no Edge Function

**Contexto:** `DATABASE.md` exige una función programada que mantenga siempre las próximas 4 semanas de `class_sessions` generadas desde `class_templates` activas. Dos fuentes externas se contradecían sobre si `pg_cron` está disponible en el plan gratuito de Supabase (una lo confirmaba, otra —más reciente— decía que ahora requiere plan Pro). Se comprobó en vivo contra el proyecto cloud real (`create extension pg_cron`, seguido de `list_extensions`): confirmado disponible y activo.

**Decisión:** `pg_cron` programa directamente una función `plpgsql` (`generate_class_sessions`), sin pasar por Edge Function ni `pg_net`. La generación es pura lógica de base de datos (leer una tabla, insertar en otra) — no hay ninguna llamada externa que justifique esa complejidad añadida.

**Alternativas consideradas:** Edge Function invocada por `pg_cron`+`pg_net` (descartada — es el patrón correcto cuando la tarea programada necesita salir de la base de datos, como enviar un email; aquí no aporta nada, solo más piezas que mantener). Disparador externo tipo GitHub Actions/Vercel Cron llamando a una función vía API (descartada — introduce una superficie de infraestructura nueva fuera de Supabase para un problema que la propia base de datos ya resuelve con una extensión estándar).

**Consecuencias:** La ejecución diaria queda registrada en `cron.job_run_details` dentro de la propia base de datos, consultable con SQL normal. Si `pg_cron` dejara de estar disponible en el plan gratuito en el futuro, este es el único punto de la aplicación que habría que migrar a un disparador externo.

---

## [2026-08-08] Formularios con campos numéricos: `useForm<Input, unknown, Output>`, dos tipos por esquema Zod

**Contexto:** El panel de admin (Fase 2) introduce los primeros formularios con campos numéricos/`<select>` de número (`aforoMaximo`, `diaSemana`). Usar `z.coerce.number()` en el esquema (necesario porque un `<input>`/`<select>` nativo siempre entrega un string) rompe el tipado de `useForm<FormValues>` con `exactOptionalPropertyTypes: true`: el tipo de entrada de `z.coerce.number()` es `unknown`, pero `FormValues` (la salida del esquema) espera `number` — TypeScript no acepta un único genérico que sirva para ambos lados a la vez.

**Decisión:** Cada esquema con campos coaccionados exporta dos tipos, no uno: `FormInput = z.input<typeof schema>` (lo que maneja `register`/`defaultValues`, con los campos coaccionados como `unknown`) y `FormValues = z.output<typeof schema>` (lo que recibe `onSubmit`, ya con `number`). El componente usa la firma de tres genéricos de React Hook Form 7.43+: `useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) })`. Además, `defaultValues` solo se incluye en el objeto de configuración cuando existe (spread condicional `...(initialValues ? { defaultValues: initialValues } : {})`), porque asignar `undefined` explícitamente a una propiedad opcional no es equivalente a omitirla bajo `exactOptionalPropertyTypes`.

**Alternativas consideradas:** Quitar `exactOptionalPropertyTypes` del `tsconfig.json` (descartada — está fijado como mínimo en `CODE_STYLE.md`, no es negociable por la comodidad de un formulario). Validar y convertir los números a mano fuera de Zod, sin `z.coerce` (descartada — duplica la conversión que Zod ya resuelve correctamente y abre la puerta a que un campo llegue a `onSubmit` como string sin que TypeScript lo detecte).

**Consecuencias:** Cualquier formulario futuro con campos numéricos (por ejemplo, cantidades en la Fase de reservas si llegara a haberlas) sigue este mismo patrón de dos tipos por esquema — ver `ClassTemplateForm.tsx` y `OneOffClassSessionForm.tsx` como referencia.

---

## [2026-08-08] Errores de negocio de `book_class_session`/`cancel_booking`/`leave_waitlist`: SQLSTATE compartido `BK001`

**Contexto:** Fase 3/4 introduce las primeras funciones RPC de Postgres con resultados de negocio que deben llegar al frontend como `{ success: false, error: { code, message } }` (regla ya fijada en `API_STANDARDS.md`/`ENGINEERING_RULES.md` para Edge Functions), pero `book_class_session`/`cancel_booking`/`leave_waitlist` son funciones `plpgsql` planas invocadas por `supabase.rpc(...)`, no Edge Functions — no había ningún precedente en el proyecto de cómo transportar un "esto es un resultado de negocio esperado, no un fallo de infraestructura" desde plpgsql hasta el resultado tipado del frontend.

**Decisión:** Las funciones lanzan `raise exception using errcode = 'BK001', message = '<CODIGO>'` (p. ej. `'CANCELLATION_TOO_LATE'`). PostgREST expone esto como `PostgrestError` con `error.code = 'BK001'` y `error.message` igual al código exacto. `bookingsApi.ts` distingue `error.code === 'BK001'` (se traduce a `{ success: false, error: { code, message: <texto en español> } }`, con el texto centralizado en un único `Record<BookingErrorCode, string>`) de cualquier otro `error.code` (fallo de infraestructura real: se registra con `console.error` y se relanza como excepción genérica). Catálogo completo de códigos: `SESSION_NOT_FOUND`, `SESSION_CANCELLED`, `SESSION_IN_PAST`, `NOT_YOUR_DEPENDENT`, `ALREADY_BOOKED`, `BOOKING_NOT_FOUND`, `ALREADY_CANCELLED`, `CANCELLATION_TOO_LATE`.

**Alternativas consideradas:** Un SQLSTATE distinto por cada código de error (descartada — ocho códigos custom no aportan nada frente a un único marcador "esto es un resultado de negocio deliberado" más un mensaje legible como identificador). Devolver un JSON serializado en el mensaje (descartada — complica el parseo en el cliente sin necesidad, el mensaje ya es el código en texto plano).

**Consecuencias:** Cualquier función RPC futura con resultados de negocio (fuera de una Edge Function) sigue este mismo patrón: `errcode = 'BK001'` + el código como `message`. Si algún día se necesita distinguir categorías de error de negocio a nivel de transporte (no solo a nivel de código), este es el punto a revisar.

---

## [2026-08-08] Aforo ocupado vía función `SECURITY DEFINER`, no agregando `bookings` desde el cliente

**Contexto:** `ClassSessionCard` necesita mostrar "plazas libres", pero la política de RLS de `bookings` (`bookings_select_own`) solo deja ver a cada usuario sus propias reservas y las de sus dependientes — un alumno nunca ve las reservas de otro, así que un `count()` client-side sobre `bookings` es estructuralmente imposible de calcular bien desde el cliente.

**Decisión:** Función `get_session_occupancy(p_session_ids uuid[])`, `language sql security definer stable`, que devuelve `(session_id, ocupadas)` — mismo patrón que `is_admin()` (`SECURITY DEFINER` para saltarse RLS de forma puntual y controlada, sin exponer de quién son las reservas, solo el recuento).

**Alternativas consideradas:** Vista SQL sobre `bookings` (descartada — el comportamiento de saltarse RLS de una vista depende de quién sea su propietario y de ajustes de Postgres que varían entre versiones; una función `SECURITY DEFINER` explícita es inequívoca). Desnormalizar un contador `ocupadas` en `class_sessions` mantenido por trigger (descartada — añade una fuente de verdad duplicada y una superficie nueva de bugs de sincronización para un cálculo que ya es trivial de hacer al vuelo dado el volumen de un único gimnasio).

**Consecuencias:** Cualquier futura necesidad de "un dato agregado sobre una tabla que RLS oculta parcialmente" sigue este mismo patrón en vez de intentar resolverlo con políticas de RLS más permisivas (que filtrarían de más).

---

## [2026-08-08] `cancel_booking`: el admin se salta el límite de 1 hora y la comprobación de propiedad

**Contexto:** No especificado en ningún documento de `AI/` — surgió al implementar `cancel_booking`: si el gimnasio cierra antes de tiempo o un entrenador cae de baja, alguien del staff necesita poder cancelar reservas de otros usuarios sin las restricciones pensadas para el autoservicio de un alumno.

**Decisión:** `cancel_booking` comprueba `is_admin()` internamente; si es admin, omite tanto la comprobación de que la reserva pertenece al que llama como el límite de cancelación de 1 hora. La promoción de lista de espera ocurre igual en ambos casos.

**Alternativas consideradas:** Una función administrativa separada (`admin_cancel_booking`) (descartada — duplicaría toda la lógica de promoción atómica sin necesidad; una sola función con una rama condicional es más fácil de mantener correcta).

**Consecuencias:** Cualquier panel de admin futuro para gestionar reservas puede llamar a la misma `cancel_booking` sin lógica especial en el cliente.

---

## [2026-08-08] `leave_waitlist`: RPC añadida más allá del boceto original de `DATABASE.md`

**Contexto:** `DATABASE.md` solo describe `book_class_session` y `cancel_booking`. Al construir `MyBookingsPage`, un usuario en lista de espera no tenía ninguna forma de salir de ella salvo esperar a ser promocionado — un callejón sin salida real de cara al usuario.

**Decisión:** Función `leave_waitlist(p_waitlist_entry_id)`, sencilla (borra la propia entrada, o cualquiera si admin), no crítica en concurrencia (no compite por ningún recurso compartido, no necesita `for update`). Se añade en la misma migración que el resto de Fase 3/4 por cohesión, no en una migración aparte.

**Alternativas consideradas:** Dejarlo fuera de esta fase y resolverlo más adelante (descartada — el coste de añadirlo ahora es mínimo y evita una regresión de UX evidente en la primera versión funcional).

**Consecuencias:** Ninguna relevante — es la pieza más simple de las cuatro funciones nuevas.

---

## [2026-08-08] Los tests de integración contra Supabase local no están conectados a CI todavía

**Contexto:** `TESTING.md` exige que `book_class_session`/`cancel_booking` se prueben contra un Supabase local real (Docker), no con mocks — la propiedad de concurrencia solo la demuestra Postgres de verdad. Ese es exactamente `npm run test:integration` (nuevo, `vitest.integration.config.ts` + `tests/integration/`). Levantar un stack de Supabase con Docker dentro de GitHub Actions es un bloque de trabajo propio, no trivial, y no estaba planificado para esta tarea.

**Decisión:** `npm run test:integration` se documenta como paso manual obligatorio antes de abrir cualquier PR que toque `book_class_session`/`cancel_booking`/`leave_waitlist`, pero no se añade todavía a `.github/workflows/ci.yml`. Deuda técnica explícita, no una omisión silenciosa.

**Alternativas consideradas:** Bloquear esta tarea hasta tener Supabase-en-Docker funcionando en CI (descartada — retrasaría significativamente llegar a una v1 funcional por una mejora de infraestructura de tests que no cambia la corrección del código en sí, solo la automatización de su verificación).

**Consecuencias:** Sigue existiendo una ventana en la que alguien podría abrir un PR sin haber corrido `npm run test:integration` en local. Follow-up pendiente: añadir un job de CI con `supabase start` (o un Postgres efímero con las migraciones aplicadas) antes de considerar cerrado el tema de testing de Fase 3/4.

---

## [2026-08-08] Descubierto: las tablas nuevas ya no se exponen a la Data API sin `GRANT` explícito — migración de permisos retroactiva

**Contexto:** Al escribir los primeros tests de integración de todo el proyecto (los primeros que hablan con un Supabase local real en vez de con mocks de Vitest), `book_class_session`/`cancel_booking` fallaban con `permission denied for table trainers` incluso usando la `service_role` key. La CLI de Supabase instalada (2.109.1) inicializa `supabase/config.toml` con `api.auto_expose_new_tables` sin fijar (por tanto `false`, el nuevo comportamiento por defecto tanto en local como "matching the new cloud default"): las tablas del esquema `public` ya NO son alcanzables por `anon`/`authenticated`/`service_role` sin un `GRANT` explícito, sin importar qué políticas de RLS tengan. Esto llevaba afectando en silencio a **todas** las tablas del proyecto (`profiles`, `dependents`, `trainers`, `class_templates`, `class_sessions`) desde que se crearon — nunca se había detectado porque ningún test anterior tocaba un Supabase local real, solo mocks.

**Decisión:** Nueva migración `20260808110000_grant_data_api_privileges.sql` que concede explícitamente `SELECT`/`INSERT`/`UPDATE`/`DELETE` a `authenticated` y `service_role` en cada tabla, ajustado a las políticas de RLS que ya existían para cada una (p. ej. `profiles` solo `SELECT`+`UPDATE` para `authenticated`, sin `INSERT`/`DELETE`, porque nunca existió política para eso). El `GRANT` de base no abre nada por sí solo — RLS sigue denegando por defecto cualquier acción sin una política permisiva que la cubra; esto solo hace que las políticas que ya existían vuelvan a ser alcanzables.

**Alternativas consideradas:** Fijar `api.auto_expose_new_tables = true` en `supabase/config.toml` para recuperar el comportamiento legacy (descartada — el propio comentario de la CLI marca ese campo como deprecado y con fecha de eliminación, 2026-10-30; depender de él sería aplazar el mismo problema, no resolverlo). Revertir solo para las tablas de Fase 3/4 y dejar Fase 1/2 rotas (descartada — la app ya no funcionaba en absoluto en local antes de este fix, no es un problema aislado de esta fase).

**Consecuencias:** Cualquier tabla nueva que se cree a partir de ahora necesita su propio `GRANT` explícito en la misma migración que la crea — ya no es automático, ni en local ni (previsiblemente) en un proyecto cloud nuevo. Vale la pena añadir este punto al checklist de creación de tablas en `AI_REVIEW_CHECKLIST.md` en un futuro cercano.