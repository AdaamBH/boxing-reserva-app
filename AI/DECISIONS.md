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

---

## [2026-08-08] Envío de emails: Edge Function invocada por el cliente tras el RPC, no trigger de base de datos con `pg_net`

**Contexto:** `AI/ARCHITECTURE.md` esboza el envío de emails de cancelación/promoción como "S->>F: Trigger de inserción en waitlist" en el diagrama de secuencia, sugiriendo un trigger de Postgres. Al implementarlo, un trigger sobre `INSERT` en `bookings` resulta ambiguo: tanto una reserva nueva confirmada como una promoción desde lista de espera insertan una fila con `estado = 'confirmada'` con la misma forma — no hay manera de distinguirlas solo con un trigger sin añadir una columna nueva. La alternativa "correcta" con las primitivas de Supabase (`pg_net.http_post` con el `service_role` key almacenado en Vault, más resolver la URL base de las Edge Functions, distinta en local y en cloud) añadía bastante infraestructura nueva (Vault, gestión de URLs por entorno) para el beneficio de dos emails no críticos.

**Decisión:** `cancel_booking` (ya `RETURNS TABLE (promoted boolean, promoted_booking_id uuid)`, migración `20260808120000`) no llama a nada por sí misma. El **cliente**, justo después de recibir un `cancel_booking` con éxito, invoca `send_cancellation_email` siempre, y `send_waitlist_promotion_email` solo si `promoted_booking_id` no es null (`bookingsApi.ts`, `notifyBookingEvent`). Ambas llamadas son best-effort: un fallo se registra con `console.error` y nunca se propaga como si la cancelación hubiera fallado — la reserva ya está cancelada/promocionada en base de datos pase lo que pase con el email.

**Alternativas consideradas:** Trigger + `pg_net.http_post` con service_role en Vault (descartada por la ambigüedad de "quién insertó esto" explicada arriba, y por la complejidad añadida de gestionar Vault + URLs de Edge Function por entorno solo para esto). Añadir una columna `promoted_at`/`is_promotion` a `bookings` para desambiguar y sí poder usar un trigger (descartada — resuelve la ambigüedad pero sigue arrastrando el problema de la URL base por entorno, y añade una columna cuyo único propósito es servir de bandera para un trigger).

**Consecuencias:** Si algún día el cliente pudiera "desaparecer" justo después de una cancelación (cierre de pestaña en el instante exacto, caída de red) antes de que la llamada a la Edge Function salga, ese email no se envía — aceptable para un email transaccional no crítico en el MVP, pero si en el futuro se necesita una garantía más fuerte de entrega, esta es la costura por la que migrar a un trigger de base de datos (con la columna de desambiguación) sería la vía.

---

## [2026-08-08] Formateo de fecha/hora duplicado entre frontend y Edge Functions, sin extraerlo a código compartido

**Contexto:** `formatSpanishDate`/`formatTime` ya existen en `src/utils/formatDate.ts` para el frontend. Las plantillas de email de las Edge Functions necesitan el mismo formateo, pero las Edge Functions corren en Deno (runtime aparte, sin acceso directo al árbol `src/` de Vite/Node sin montar un import map compartido entre ambos).

**Decisión:** Duplicar las dos funciones (5 líneas en total) en `supabase/functions/_shared/formatDate.ts`, con un comentario explícito señalando que es una duplicación deliberada. `CODE_STYLE.md` prohíbe duplicar *lógica de negocio* entre frontend y Edge Function sin compartirla — un formateador de fecha puramente de presentación, sin ninguna regla de negocio dentro, se interpreta aquí como fuera de esa prohibición.

**Alternativas consideradas:** Montar un import map o publicar un paquete interno compartido entre el proyecto Vite y las Edge Functions Deno (descartada — infraestructura desproporcionada para 5 líneas sin lógica real, YAGNI).

**Consecuencias:** Si `formatSpanishDate`/`formatTime` cambiaran de comportamiento en el frontend, alguien tiene que acordarse de replicar el cambio en `supabase/functions/_shared/formatDate.ts` a mano — riesgo pequeño y explícitamente aceptado dado lo trivial de la función.

---

## [2026-08-08] Lista de clase (roster): visible para cualquier alumno, "Nombre I." para todos sin distinción

**Contexto:** Petición del cliente: al mirar una clase, poder ver quién está dentro (confirmados) y quién está en lista de espera, cada lista ordenada de quien reservó antes a quien reservó después. Esto no estaba en ningún documento de `AI/` y tiene una implicación de privacidad real: por defecto expondría nombres de otras personas (y de menores, vía `dependents`) a cualquier alumno logueado — con menores de por medio, `SECURITY.md`/RGPD obligan a no asumirlo sin más.

**Decisión (confirmada explícitamente con el cliente, dos preguntas seguidas):** visible para **cualquier alumno autenticado** (no solo admin), mostrando **"Nombre + inicial del apellido"** (p. ej. "Lucas P.") — **el mismo formato para todos, adultos y menores, sin distinción**. Nunca el apellido completo, nunca otro dato de la reserva (ni email, ni quién es el padre/madre, ni el `user_id`).

Implementación: `get_session_roster(p_session_id)` (`SECURITY DEFINER`, `stable`, migración `20260808130000`) es la única vía de lectura — las políticas de RLS de `bookings`/`waitlist_entries` **no se tocan** (siguen restringidas a "mis propias reservas"), evitando el riesgo de que ampliar RLS para este caso concreto termine filtrando más de lo previsto en otra parte de la app. La función solo proyecta `estado`, `display_name` (ya truncado dentro de la propia consulta SQL, nunca en el cliente) y `orden` (`row_number()` por `created_at`). En el frontend, `SessionRosterList` se monta solo cuando el usuario despliega "Ver lista de la clase" en la tarjeta (no se precarga para todas las sesiones de golpe) — menos consultas y menos exposición de datos por defecto.

**Alternativas consideradas:** Ampliar la política de RLS de `bookings`/`waitlist_entries` para que cualquier `authenticated` vea todas las filas de una sesión (descartada — expondría la fila completa, incluido a quién pertenece cada reserva, no solo el nombre truncado; además debilitaría la garantía "solo veo mis propias reservas" en cualquier otro sitio de la app que confíe en esa RLS). Solo admin ve la lista, y el resto de alumnos solo un recuento (como `get_session_occupancy`) (descartada tras la respuesta explícita del cliente pidiendo verlo todos los alumnos). Nombre completo para adultos y solo inicial para menores (ofrecida como opción recomendada, descartada por el cliente a favor de un único formato consistente para todos).

**Consecuencias:** Cualquier alumno puede llegar a identificar a otro alumno (o al hijo/a de otro alumno) por nombre + inicial si ya sabe quién suele ir a qué clase — riesgo de privacidad menor, aceptado conscientemente por el cliente. Si en el futuro se pidiera ocultar esto de nuevo, el cambio se limita a `get_session_roster` (quién puede llamarla y qué proyecta) sin tocar el modelo de RLS de `bookings`/`waitlist_entries`.

---

## [2026-08-08] Dirección visual de la app: identidad de gimnasio de boxeo, no plantilla SaaS genérica

**Contexto:** Hasta ahora la app usaba Tailwind por defecto (`slate-*`, `white`, fuente del sistema) salvo el acento `rose-800` de `Button` (ya justificado como "cuero de guante" en su propio comentario). El cliente pidió explícitamente que la interfaz "se vea y quede muy bien como demás aplicaciones modernas y de profesionales" y conectar la navegación que faltaba. Se usó el skill `interface-design` del repo: exploración de dominio antes de tocar color/tipografía, dirección propuesta y confirmada explícitamente con el cliente antes de construir.

**Decisión:** Paleta cálida de un solo matiz (lona/canvas, cuero oxblood como único acento, cuerda de rin como acento secundario, tiza) definida como tokens en `src/styles/index.css` (`canvas`, `ink`, `chalk`, `line`, `rope`, además del `brand` ya existente). Tipografía Oswald (condensada, cartel de combate) para títulos vía regla global `h1-h4`, Work Sans para cuerpo. Firma visual: `CapacityTally`, un marcador de aforo con círculos rellenos/en contorno estilo tarjeta de asalto, reutilizado como los "dorsales" numerados de la lista de la clase. Detalle completo y con qué usar cada token en `.interface-design/system.md`.

**Alternativas consideradas:** Estilo SaaS neutro (azules, sans genérica) — ofrecido explícitamente como alternativa, descartado por el cliente a favor de una identidad con más carácter. Modo oscuro como parte de esta pasada — descartado, sigue fuera de alcance del MVP (`AI/PROJECT_CONTEXT.md`), los tokens solo definen un tema claro.

**Consecuencias:** El panel de admin y algunas pantallas secundarias solo recibieron una sustitución mecánica de tokens de color (mismo layout, colores correctos), no una revisión de jerarquía/composición dedicada — pendiente como pulido futuro si se quiere el mismo nivel de cuidado que `ClassSessionCard`/`AppShell`. Cualquier componente nuevo debe tomar sus colores de estos tokens, nunca de clases `slate-*`/`rose-*`/`red-*`/`emerald-*` de Tailwind directamente (ver `.interface-design/system.md`).

---

## [2026-08-08] Landing page pública en "/", fuera del alcance original del proyecto

**Contexto:** Ningún documento de `AI/` planificaba una landing page — el proyecto se diseñó como una herramienta de reserva para alumnos ya captados, no como un embudo de adquisición. `/` era un redirect directo a `/clases` (que a su vez rebotaba a login si no había sesión). El cliente pidió explícitamente una landing "visualmente impactante... que se entienda rápido qué ofrece... con buenos CTA", ampliando el alcance de forma consciente, no accidental.

**Decisión:** Landing en `src/features/marketing/` (`LandingPage` + `LandingHeader`/`Hero`/`Features`/`HowItWorks`/`Cta`/`Footer`), montada en `/`. `LandingPage` comprueba sesión con `useAuth()`: si ya hay sesión, redirige a `/clases` sin mostrar marketing — solo la ve quien de verdad la necesita. Reutiliza el sistema de diseño ya existente (palette/tipografía/`CapacityTally`) en vez de una identidad nueva — la búsqueda inicial en la base de datos de `ui-ux-pro-max` sugería una paleta naranja/verde genérica de "fitness app", descartada explícitamente por romper la continuidad con la app real. Microinteracciones de scroll-reveal con `IntersectionObserver` nativo (`useScrollReveal`/`Reveal`), sin añadir ninguna librería de animación.

**Alternativas consideradas:** Adoptar la paleta que sugería `ui-ux-pro-max` por defecto para "fitness/gym app" (naranja/verde) — descartada, ver arriba. Añadir GSAP para las animaciones de scroll — descartada por ahora: el proyecto no tenía ninguna dependencia de animación, y `IntersectionObserver` + transiciones CSS cubren el nivel de movimiento pedido ("sutiles") sin peso extra.

**Consecuencias:** Sin fotografía real del gimnasio ni testimonios todavía — la sección de "por qué reservar aquí" se apoya en las ventajas funcionales reales (aforo, lista de espera, cancelación, avisos), no en contenido que habría que inventar. Cuando haya fotos/reseñas reales, es un añadido incremental, no un rediseño.

---

## [2026-08-08] Code-splitting por ruta: `React.lazy`, no `next/dynamic`

**Contexto:** Auditoría con la skill `vercel-react-best-practices`. El build llevaba toda la sesión avisando de un único bundle de ~628 kB (177 kB gzip) sin ningún `import()` dinámico — el panel de admin, la ficha de dependientes, la lista de la clase, etc. se descargaban siempre, aunque un alumno normal solo visite `/clases` y `/mis-reservas`.

**Decisión:** Cada página de `router.tsx` pasa a `React.lazy(() => import(...).then(m => ({ default: m.X })))` — el `.then` hace falta porque todos los componentes de página usan exportación con nombre (`CODE_STYLE.md`), no por defecto, y `React.lazy` exige un `default`; no se ha cambiado el estilo de exportación de ningún componente para evitarlo. `AppShell` añade su propio `<Suspense>` alrededor del `<Outlet/>` (no solo uno global) para que la cabecera/nav no desaparezca al cambiar de pestaña, solo el área de contenido muestra el estado de carga. Nuevo componente compartido `PageFallback` (sustituye el bloque "Cargando…" que `ProtectedRoute`/`AdminRoute` ya repetían cada uno por su cuenta).

**Alternativas consideradas:** `next/dynamic` (descartada — es la API que sugiere la skill por defecto, pero es específica de Next.js; este proyecto es Vite + React Router puro, `React.lazy` es el equivalente real). Un único `<Suspense>` global en vez de uno anidado dentro de `AppShell` (descartada — haría que la nav parpadeara/desapareciera en cada cambio de pestaña dentro de la app, peor experiencia que perderlo solo en la carga inicial).

**Consecuencias:** El bundle principal baja a ~468 kB (135 kB gzip); cada página es su propio chunk de pocos KB, y `/admin/*` no se descarga nunca para un alumno que no es admin. Cualquier página nueva que se añada a `router.tsx` debe seguir el mismo patrón `lazy(...)`, no un `import` estático directo.

---

## [2026-08-08] Testeo con TestSprite (MCP): un bug real encontrado, varios hallazgos descartados tras investigar

**Contexto:** Petición del cliente de pasar el proyecto por TestSprite (MCP) para un pase de pruebas E2E automatizado contra el build de producción (`vite preview`, puerto 4173) sobre Supabase local. Se ejecutaron tres pasadas: la primera sin credenciales reales (fallo propio — `additionalInstruction` vacío hizo que TestSprite inventara `example@gmail.com`/`password123`, bloqueando 28 de 30 tests sin decir nada del estado real de la app); la segunda con la cuenta desechable `testsprite@example.com` no devolvió resultados utilizables (fallo transitorio del backend de TestSprite, `"Test not found or no permission"` en los 30 tests); la tercera, ya con la cuenta real de administrador del cliente (`adambenrahal250@gmail.com`, promovida a `role='admin'` en local), sí devolvió resultados fiables: 21/30 passed, 4 failed, 5 blocked. El cliente pidió explícitamente revisar y arreglar todo lo que hubiera fallado o quedado bloqueado.

**Decisión:** De los 9 tests no-passed, solo uno señalaba un problema real de la app, y se arregló: **no existía ningún enlace dentro de la aplicación hacia `/dependientes/nuevo`** (la ruta solo era alcanzable escribiendo la URL a mano) — causa real de TC015 y TC026. Se añadió un enlace "¿Reservas para un menor a tu cargo? Añade un dependiente" en `BookClassSessionButton.tsx`, visible siempre (no solo cuando ya hay dependientes), que es el punto natural donde un padre/madre lo necesitaría. El resto de fallos, tras investigar cada uno, no son bugs de la app:
- **TC019/TC027** ("el checkbox de consentimiento aparece marcado pero la validación sigue fallando"): el propio script Python generado por TestSprite nunca llega a seleccionar una opción válida en el `<select>` de "Tu relación con el/la menor" (en TC019 no lo toca; en TC027 intenta `select_option("")`, que es la opción placeholder `disabled`) — el formulario rechaza correctamente un envío incompleto, y el agente de IA de TestSprite narró el error de consentimiento visible sin notar que `relacion` también era inválido. Confirmado revisando `AddDependentForm.tsx`/`schemas.ts` (sin cambios necesarios) y con el test unitario existente (`AddDependentForm.test.tsx`), que ejercita exactamente esta interacción (marcar consentimiento + seleccionar relación) y pasa.
- **TC004/TC007** (mensaje de "demasiados intentos"): el limitador de tasa de registro de Supabase Auth saltó por las múltiples cuentas creadas en poco tiempo dentro de la misma pasada de 30 tests — comportamiento correcto, no un bug.
- **TC010** (bloqueado: "no había cuenta no-admin disponible"): solo se le dio a TestSprite la cuenta admin en esta pasada; hace falta una cuenta explícitamente no-admin para poder probar ese caso.
- **TC020/TC021**: fallos de estado compartido, no de lógica — los 30 tests reutilizan la misma cuenta real contra los mismos datos de Supabase local sin resetear entre tests, así que una clase ya reservada por un test anterior o una entrada de lista de espera ya abandonada por otro test hacen que un test posterior vea un estado distinto al que esperaba. La app está rechazando correctamente una reserva duplicada (`ALREADY_BOOKED`), que es justo la garantía que debe cumplir.

**Alternativas consideradas:** Añadir un enlace "Dependientes" a la barra de navegación de `AppShell` en vez de (o además de) dentro del flujo de reserva (descartada por ahora — el flujo de reserva es el punto de necesidad real detectado por las pruebas; añadir un quinto ítem a la barra de pestañas móvil no estaba pedido y choca con la guía de "máximo ~5 en nav inferior" ya seguida en el diseño existente). Relanzar una cuarta pasada completa de TestSprite (de pago) solo para confirmar que ya no fallan TC019/TC020/TC021/TC026/TC027 (descartada por ahora — el análisis de código + el test unitario existente ya dan confianza suficiente sin gastar otra pasada; los fallos de estado compartido volverían a aparecer de todos modos mientras no se resetee la base de datos entre tests).

---

## [2026-08-09] Tarjeta de clase compacta + dependiente por defecto en Ajustes (sustituye parte de la decisión del 2026-08-08)

**Contexto:** Feedback directo del cliente tras ver la app en local: `ClassSessionCard` ocupaba demasiado (nombre + badge de nivel + fecha/hora + entrenador + aforo con `CapacityTally` + acciones) para una lista de varias clases por día. Además, el selector "¿para quién es la reserva?" dentro de `BookClassSessionButton` (añadido el 2026-08-08 junto con el enlace a "Añadir dependiente") resultaba tedioso para un padre/madre que casi siempre reserva para el mismo hijo/a, y ese mismo selector aparecía también para alumnos sin dependientes que no lo necesitan para nada.

**Decisión:**
1. `ClassSessionCard` pasa a tres filas icono+texto (horario, tipo de clase + nivel, entrenador) sin fecha (ya es implícita: la tarjeta vive bajo un día ya seleccionado en `ReservasPage`) y **sin indicador de aforo/`CapacityTally`** — el control de aforo real sigue siendo 100% de `book_class_session` (RPC atómica), esto solo quita el contador visual previo a reservar. Nuevos iconos de línea (`ClockIcon`, `TagIcon`, `UserIcon`) siguiendo el mismo estilo que los ya existentes.
2. La acción "Reservar" deja de ser un `<Button>` con caja y pasa a ser texto en `brand-600` que resalta por color/peso, no por chrome — mismo patrón para "Ver Clase" (antes "Ver quién está apuntado") pero en `ink-faint`, deliberadamente más discreto que "Reservar". De paso se corrige un enlace roto: apuntaba a `/reservas/:id/lista`, una ruta que nunca existió (el router real es `/clases/:id/lista` — la página se llama "Reservas" mentalmente, pero la ruta se dejó como `/clases` al hacer el rename de navegación).
3. Nueva columna `profiles.default_dependent_id` (migración `20260809200000`, `uuid references dependents(id) on delete set null`, sin política de RLS nueva — `update_own_profile` ya cubre cualquier columna de la fila propia). `NULL` = reservar para uno mismo. Ajustes → sección "Dependientes": con 0 dependientes solo aparece el enlace para añadir uno (que se ha movido aquí desde `BookClassSessionButton`, que ya no lo muestra); con 1+ dependientes aparece un interruptor ("Reservar siempre para un dependiente", componente nuevo `ToggleSwitch`) que con varios hijos muestra además un `<select>` para elegir cuál. `BookClassSessionButton` ya no tiene formulario ni `react-hook-form`: reserva usando `profile.default_dependent_id` directamente, sin preguntar en cada clase.

**Alternativas consideradas:** Preguntar "¿para ti o para tu hijo/a?" en cada reserva pero con el dependiente ya preseleccionado (descartada — el cliente pidió explícitamente que no haga falta ninguna pregunta mientras el ajuste esté activo). Guardar el "dependiente por defecto" en el propio dependiente (`dependents.es_favorito boolean`) en vez de en `profiles.default_dependent_id` (descartada — con varios hijos habría que garantizar que solo uno sea favorito a la vez, lo que exige un índice único parcial o un trigger; una columna nullable en `profiles` ya modela "como mucho uno" de forma trivial). Quitar `getRemainingSpots`/`isSessionFull`/`useSessionOccupancy`/`CapacityTally` del código al dejar de usarse en `ClassSessionCard` (descartada — siguen usándose en `SessionRosterList` y `LandingHero`, y `useSessionOccupancy` es una utilidad ya probada que probablemente haga falta de nuevo si el aforo vuelve a mostrarse en otro sitio, p.ej. en "Ver Clase").

**Consecuencias:** El aforo ya no es visible de un vistazo en la lista de clases — si en el futuro se pide recuperarlo, el sitio natural es la página de "Ver Clase" (`SessionRosterPage`), no la tarjeta compacta. Reservar para un menor ahora es una preferencia de cuenta, no una elección por reserva: si un padre/madre quiere reservar puntualmente para sí mismo teniendo el ajuste activado, tiene que apagarlo primero en Ajustes (aceptado explícitamente por el cliente como intercambio a favor de menos fricción en el caso común).

**Consecuencias:** Si se vuelve a testear con TestSprite en el futuro: (1) pasar siempre credenciales reales explícitas por `additionalInstruction`, nunca confiar en que TestSprite las adivine; (2) usar una cuenta no-admin dedicada además de la admin si se quiere cubrir TC010 y similares; (3) resetear `supabase db reset` entre pasadas si se quiere que los tests de reserva/lista de espera partan de un estado limpio y comparable; (4) los `.py` generados por TestSprite pueden tener bugs propios (como el `<select>` no elegido en TC019/TC027) — conviene leer el script antes de asumir que un "Failed"/"Blocked" es un bug de la app.

---

## [2026-08-11] Colores por tipo de clase + `WeekDayStrip` sin scroll horizontal

**Contexto:** Pulido de la pantalla de Reservas pedido por el cliente: (1) `ClassSessionCard` seguía teniendo demasiado espacio en blanco entre filas para que quepan varias clases sin desplazarse; (2) `WeekDayStrip` usaba `flex` + `min-w-12` + `overflow-x-auto`, así que en pantallas estrechas (~360px o menos) los 7 días no cabían y hacía falta deslizar dentro de la propia barra para llegar de lunes a domingo — deslizar debía servir solo para cambiar de semana; (3) sin ninguna forma de distinguir visualmente un tipo de clase de otro salvo leyendo el nombre.

**Decisión:**
1. `ClassSessionCard` pasa de tres filas a dos (horario+badge de tipo / entrenador+nivel) y reduce `padding`/`gap` (`p-4`→`p-3`, `gap-3`→`gap-2`). El tipo de clase (`session.nombre`) ya no ocupa su propia fila con `TagIcon`: se muestra como una píldora de color de fondo.
2. Nuevo `getClassTypeColorClass` (`src/utils/classTypeColor.ts`): hash determinista del nombre de la clase sobre una paleta fija de 6 tonos apagados (`--color-tag-cream/blue/yellow/green/lavender/rose`, definidos en `styles/index.css`). Determinista y no aleatorio a propósito — la misma clase debe verse siempre del mismo color entre renders/recargas, sin guardar nada en base de datos ni añadir un campo `color` a `class_sessions`.
3. `WeekDayStrip` pasa de `flex`/`overflow-x-auto` a `grid grid-cols-7` con `min-w-0` en cada botón: los 7 días siempre caben en el ancho disponible (se encogen en vez de desbordar), nunca hace falta deslizar dentro de la barra. Deslizar horizontalmente sobre la barra (`onTouchStart`/`onTouchEnd`, umbral 40px, eje dominante horizontal) ahora dispara `onPrevWeek`/`onNextWeek` — el mismo gesto que antes solo desplazaba la lista de días, ahora cambia de semana completa, igual que las flechas.

**Alternativas consideradas:** Añadir un campo `color` editable a `class_templates`/`class_sessions` para que el color lo elija el gimnasio (descartada por ahora — fuera de alcance de este pulido visual, y un hash determinista ya da consistencia sin migración ni UI de administración nueva; si el cliente pide elegir colores a mano, es la vía natural más adelante). Usar una librería de gestos (`react-swipeable` o similar) para el deslizar semana a semana (descartada — el gesto es trivial con `TouchEvent` nativo, no vale la pena la dependencia).

**Consecuencias:** Paleta de 6 colores: con 7+ tipos de clase distintos en la misma franja visible, dos nombres distintos pueden compartir color por colisión de hash — aceptable dado que el nombre de la clase sigue siendo el texto visible en la píldora, el color es un refuerzo visual, no el único identificador. El gesto de deslizar en `WeekDayStrip` no tiene equivalente de ratón/teclado propio (las flechas ya cubren ese caso en desktop), y no se ha añadido a los tests de Playwright (`tests/e2e/`) por no tener uno existente que simule touch — si se añade cobertura e2e de esta pantalla en el futuro, cubrir el swipe ahí.

---

## [2026-08-11] Pulido de landing (jerarquía real, firma de "cuerda") + skeletons de carga

**Contexto:** El cliente pidió mejorar la landing y "lo visual" en general, además de la fluidez/funcionamiento, apoyándose explícitamente en las skills `interface-design` y `ui-ux-pro-max`. Al consultar la base de datos de `ui-ux-pro-max` para "fitness gym app" volvió a salir la paleta genérica naranja/azul eléctrico de "Fitness/Gym App" — la misma sugerencia ya rechazada el 2026-08-08 (ver esa entrada) por romper la identidad del proyecto. Se descarta otra vez por el mismo motivo: `ui-ux-pro-max` se usó para patrones de estructura (`--domain landing`, `--domain ux`), no para reemplazar la paleta ya confirmada con el cliente. `interface-design` no cubre landing pages según su propio alcance declarado, así que se aplicó al resto de UI de producto (estados de carga) y sus fundamentos de jerarquía/craft se usaron igualmente para la landing de forma manual.

**Decisión:**
1. Landing: nuevo `LandingCtaButton` (extrae la clase CSS que Header/Hero/CTA repetían idéntica 3 veces). Nueva textura `.bg-canvas-texture` (trama cruzada al 3.5%, evoca lona de ring) solo en las secciones de apertura/cierre (Hero, CTA final). `LandingHowItWorks` conecta los 3 pasos con una línea discontinua color `rope` (firma visual, no una barra de progreso de wizard genérica). `LandingFeatures` deja de ser una rejilla 2×2 de 4 tarjetas idénticas: la feature real-diferenciadora ("Aforo real, sin sorpresas") pasa a un tratamiento propio más grande, las otras 3 quedan como fila de apoyo — jerarquía en vez de peso uniforme. Footer con 3 puntos de confianza reales (aforo en tiempo real, cancelación 1h, RGPD/menores) sacados de `PROJECT_CONTEXT.md`/`SECURITY.md`, no textos de marketing inventados — se mantiene la norma ya escrita en `.interface-design/system.md` de no fabricar fotografía ni testimonios.
2. Fluidez: nuevo `Skeleton` (`src/components/Skeleton.tsx`) + skeletons con la silueta exacta de `ClassSessionCard`/`BookingListItem` en `ReservasPage` y `MyBookingsPage`, sustituyendo un texto plano "Cargando…" — la lista ya tiene la forma correcta antes de que lleguen los datos, menos salto de layout. Se mantiene un `<span className="sr-only">` con el mismo texto que antes para no perder el aviso accesible.

**Alternativas consideradas:** Regenerar el sistema de diseño completo con `--design-system` de `ui-ux-pro-max` (descartada — habría sustituido la paleta/tipografía ya confirmada por el cliente el 2026-08-08 por defaults genéricos de "fitness app"). Fotografía real del gimnasio o testimonios de alumnos para dar más "prueba social" a la landing (descartada — no existe contenido real todavía; fabricarlo violaría la norma ya escrita de no inventar testimonios/fotos). Extender los skeletons de carga a todas las pantallas de la app en la misma pasada (descartada por ahora — se acotó a las dos pantallas de mayor uso, `ReservasPage`/`MyBookingsPage`; el resto sigue con "Cargando…" simple hasta que se detecte que importa).

**Consecuencias:** Cualquier futura sección de landing debería seguir el mismo criterio — usar `ui-ux-pro-max` solo para estructura/UX, nunca para paleta, y no fabricar contenido de prueba social. Si en el futuro se añaden fotos/testimonios reales, el sitio natural es `LandingFeatures`/una nueva sección, no forzarlos en el hero actual. `Skeleton` queda como primitivo reutilizable — cualquier lista nueva con estado de carga debería componer un skeleton con su misma silueta en vez de volver a un texto "Cargando…" suelto.

---

## [2026-08-11] Bug: rutas internas devuelven 404 en Vercel (falta `vercel.json`)

**Contexto:** El cliente reportó que la app "se colapsa" al pulsar el botón de atrás del navegador, y que solo funciona si navega pulsando enlaces dentro de la app. Comprobado directamente contra la producción ya desplegada (`curl` a `https://boxing-reserva-app.vercel.app/clases` y `/mis-reservas`): ambas devuelven **404**, mientras que `/` devuelve 200. Diagnóstico: React Router resuelve las rutas en el navegador (`pushState`), pero Vercel sirve el build de Vite como archivos estáticos — sin una regla de *rewrite* explícita, cualquier petición que golpea el servidor directamente por una ruta que no es un archivo real (recargar la página, escribir la URL a mano, o el sistema operativo de un móvil descartando la pestaña en segundo plano y recargándola al volver atrás) no encuentra nada y Vercel devuelve 404 en vez de `index.html`. Navegar pulsando enlaces dentro de la app nunca toca el servidor (todo vía `pushState`), por eso "solo funciona si le marcas dónde quieres ir". No reproducible en local (`npm run dev`/`npm run preview`) porque el servidor de Vite sí sirve `index.html` como *fallback* de serie — el bug es específico de cómo Vercel sirve el build estático.

**Decisión:** `vercel.json` en la raíz del repo con `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` — cualquier ruta que no sea un asset real cae en `index.html`, y React Router toma el control del lado del cliente igual que en local.

**Alternativas consideradas:** Ninguna real — es la solución estándar y documentada por Vercel para cualquier SPA con enrutado del lado del cliente que no use un framework con detección automática de esto (Next.js sí lo resuelve solo; Vite no).

**Consecuencias:** Cualquier ruta nueva que se añada en `router.tsx` sigue funcionando sin tocar `vercel.json` (la regla es un comodín, no una lista por ruta). Este fallo llevaba desde el primer despliegue con rutas (`AppShell`/navegación conectada, PR #9) sin que nadie lo notara porque las pruebas manuales siempre navegaban pulsando enlaces — buena razón para probar explícitamente "recargar en una ruta interna" y "atrás del navegador" en el checklist de `AI/AI_REVIEW_CHECKLIST.md` de aquí en adelante.

---

## [2026-08-11] Bug: login/perfil se quedaba en "Cargando…" para siempre si la red fallaba a medias

**Contexto:** El cliente reportó que al iniciar sesión en producción (`boxing-reserva-app.vercel.app`) la pantalla se quedaba pillada en "Cargando…" sin avanzar ni mostrar error. Revisando los logs de Auth/API de Supabase: la cuenta ya estaba confirmada y ya era admin (nada que arreglar ahí), pero **ninguna petición nueva llegaba siquiera a Supabase** — indicando que el problema estaba en el tramo cliente↔red, no en el backend. El cliente de Supabase usa `fetch` sin ningún timeout propio: si una conexión se queda colgada (red móvil inestable, algún intermediario que no cierra la conexión) en vez de fallar rápido, la promesa nunca se resuelve ni se rechaza. `LoginForm` esperaba esa promesa con `isSubmitting` (el botón se queda en "Cargando…" sin límite) y, tras un login, `ProtectedRoute` esperaba la carga del perfil (`useProfile`) con la misma falta de límite — `PageFallback` a pantalla completa sin salida salvo recargar a ciegas. Además, `useAuth()` ya calculaba `profileError` pero **ninguna pantalla lo leía nunca** — un fallo real de la consulta de perfil (no solo un timeout) tampoco tenía forma de mostrarse.

**Decisión:** Nuevo `withTimeout()` (`src/utils/withTimeout.ts`) que envuelve cualquier promesa con un límite de tiempo (15s) y la convierte en un error legible en español si se cuelga — nunca en una carga infinita. Aplicado a las cinco llamadas de `authApi.ts` (`signIn`, `signUp`, `signOut`, `requestPasswordReset`, `updatePassword`) y a la consulta de perfil en `useProfile.ts`. `ProtectedRoute` ahora sí comprueba `profileError`: si el perfil falla o hace timeout, muestra un mensaje y un botón "Reintentar" (recarga la página, para repetir sesión + perfil desde cero) en vez de quedarse en blanco o en un spinner sin salida.

**Alternativas consideradas:** Un `AbortController` con timeout pasado directamente al cliente de Supabase (descartada — el SDK de `@supabase/supabase-js` v2 no expone un hook de timeout por-llamada sencillo sin reconfigurar el `fetch` global del cliente, más invasivo que envolver la promesa en la capa de la app). Reintentos automáticos indefinidos en vez de un timeout con error visible (descartada — un login o una carga de perfil colgada necesita decírselo al usuario, no reintentar en silencio para siempre).

**Consecuencias:** 15s es un valor razonable para redes móviles lentas sin hacer esperar demasiado en una red realmente caída; si en el futuro esto da falsos positivos en conexiones muy lentas pero funcionales, es el único número que hay que tocar (ambas constantes están juntas en cada archivo). Cualquier pantalla nueva que dependa de una llamada de red que pueda bloquear la UI a pantalla completa debería seguir el mismo patrón (`withTimeout` + mostrar el error con una acción de reintento), no asumir que la promesa siempre se resuelve.