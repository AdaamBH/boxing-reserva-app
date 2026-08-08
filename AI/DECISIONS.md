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