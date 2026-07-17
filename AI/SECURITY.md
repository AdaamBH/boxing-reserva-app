# SECURITY.md

> "Seguridad desde el diseño, no añadida al final" (principio del proyecto). Este documento no es una lista de buenas intenciones — cada punto de aquí tiene que verificarse en `AI_REVIEW_CHECKLIST.md` antes de dar por terminada cualquier tarea que toque datos de usuarios.

## Qué es el RGPD y por qué te afecta directamente

Preguntaste qué significa RGPD, así que va la explicación corta antes de entrar en las reglas concretas: el **RGPD** (Reglamento General de Protección de Datos, "GDPR" en inglés) es la normativa de la Unión Europea que regula cómo cualquier empresa o proyecto puede recoger, guardar y usar datos personales de personas físicas (nombre, email, teléfono, fecha de nacimiento...). España lo desarrolla con una ley propia, la **LOPDGDD** (Ley Orgánica de Protección de Datos y garantía de los Derechos Digitales).

En la práctica, para tu aplicación, el RGPD/LOPDGDD implica cosas muy concretas:
- Solo puedes pedir los datos que realmente necesitas para el servicio (principio de minimización) — no pidas "por si acaso".
- Las personas tienen derecho a ver qué datos tienes de ellas, corregirlos, y pedir que los borres.
- Hay reglas especiales y más estrictas cuando los datos son de **menores de edad** (tu caso, con los hijos gestionados por sus padres).
- Un fallo de seguridad que exponga datos personales es una cuestión legal real, no solo un bug — de ahí que esto no sea "añadido al final".

## Autenticación

- Proveedor: **Supabase Auth** (email + contraseña). No se construye un sistema de autenticación propio — reinventar esto introduce riesgo sin ningún beneficio (ver justificación en `ARCHITECTURE.md`).
- **Verificación de email obligatoria** antes de poder reservar (no antes de poder registrarse — el registro debe completarse, pero las acciones sensibles esperan a la verificación).
- Recuperación de contraseña vía email (Resend + Supabase Auth).
- Política de contraseñas: mínimo 8 caracteres — validado tanto en el formulario (feedback inmediato) como en el servidor (Supabase Auth lo exige de todas formas; nunca asumas que el frontend es la única barrera).
- Las sesiones se gestionan con los tokens JWT que emite Supabase Auth; el cliente nunca gestiona contraseñas ni tokens "a mano".

## Autorización: Row Level Security, no comprobaciones solo en el frontend

Esta es la regla de seguridad más importante del proyecto: **una comprobación de permisos que solo vive en el código de React no es seguridad, es UX.** Cualquiera puede leer el código del frontend o llamar directamente a la API sin pasar por tu interfaz. Por eso, cada tabla en Supabase tiene sus reglas de **Row Level Security (RLS)** activas desde el momento en que se crea — no se añaden "cuando dé tiempo".

Matriz de permisos (detalle técnico de cada política en `DATABASE.md`):

| Acción | Alumno | Admin |
|---|---|---|
| Ver sus propias reservas y las de sus dependientes | ✅ | ✅ (todas) |
| Reservar/cancelar para sí mismo o sus dependientes | ✅ (vía función atómica) | ✅ |
| Ver/editar su propio perfil | ✅ | ✅ (cualquiera) |
| Crear/editar clases y entrenadores | ❌ | ✅ |
| Ver reservas de otro alumno | ❌ | ✅ |

Regla de trabajo para cualquier tabla nueva que se cree en el futuro: **no existe una tabla sin política de RLS explícita.** Una tabla sin RLS activada en Supabase es, por defecto, legible/escribible por cualquiera con la clave pública — este es el error de seguridad más común y más grave en proyectos Supabase reales.

## Validación de datos

- **Zod** en el frontend (feedback inmediato al usuario) **y** en cada Edge Function (porque el frontend se puede saltar). Mismo esquema, compartido — no se duplica la definición de "qué es un email válido" en dos sitios distintos que puedan desincronizarse.
- Nunca se confía en un ID, rol o cantidad que venga del cliente sin revalidar en el servidor (ejemplo: el rol de un usuario se lee de la tabla `profiles` en el servidor, nunca del token que envía el cliente sin verificar).

## Menores de edad: la parte más delicada de este proyecto

Confirmaste que habrá alumnos menores de edad, gestionados enteramente desde la cuenta de su padre/madre, sin acceso propio. Esto encaja bien con la ley española, pero hay que ser precisos:

- La **LOPDGDD (artículo 7)** fija en España la edad mínima para que una persona pueda dar **su propio consentimiento** sobre el tratamiento de sus datos en **14 años**. Por debajo de esa edad, el tratamiento de datos del menor **solo es lícito con el consentimiento del titular de la patria potestad o tutela** (su padre, madre o tutor legal).
- Tu modelo — el menor no tiene cuenta, todo pasa por la cuenta del padre/madre (`dependents`, ver `DATABASE.md`) — es exactamente el enfoque correcto para esto: es el padre/madre quien, al usar la app y registrar a su hijo/a como dependiente, está prestando ese consentimiento en su nombre.
- Consecuencias prácticas para la implementación:
  - En el formulario de alta de un dependiente, el texto debe dejar explícito que quien lo rellena consiente el tratamiento de los datos de su hijo/a con la finalidad de gestionar sus reservas — no puede ser un checkbox genérico de "acepto términos" perdido al final.
  - Los derechos de acceso, rectificación y borrado sobre los datos de un dependiente los ejerce el padre/madre titular de la cuenta — no hace falta un mecanismo separado para el menor.
  - No se recogen de los dependientes más datos que los estrictamente necesarios para gestionar la reserva (nombre, apellidos, fecha de nacimiento, relación). Nada de datos económicos, escolares o de salud de la familia — la LOPDGDD lo prohíbe expresamente salvo consentimiento adicional explícito, y aquí no hace falta.
  - Cualquier texto informativo dirigido a menores (si alguna vez lo hay) debe estar en lenguaje claramente comprensible para su edad — no es tu caso ahora mismo porque el menor no interactúa directamente con la app, pero queda anotado por si cambia.

## Protección de datos en tránsito y en reposo

- HTTPS en todas partes, sin excepción — lo cubren Vercel y Supabase por defecto, no hay configuración manual que se pueda olvidar.
- Ninguna clave secreta (service role key de Supabase, API key de Resend) se expone jamás en código de cliente. La `service role key` de Supabase **solo** se usa dentro de Edge Functions (entorno de servidor); el cliente usa siempre la `anon key` pública, que depende enteramente de que RLS esté bien configurado para ser segura.
- Variables de entorno: nunca en el repositorio (`.env` en `.gitignore` desde el primer commit); se documenta qué variables hacen falta en un `.env.example` sin valores reales (detalle en `CONTRIBUTING.md` y `DEPLOYMENT.md`).

## Registro de acciones sensibles (auditoría básica)

Sin llegar a un sistema de auditoría complejo (no lo necesitas en el MVP), sí conviene guardar como mínimo:
- Quién cancela una sesión completa de clase (¿admin, por qué motivo?) — un campo simple en `class_sessions` es suficiente por ahora.
- Marca de tiempo de cancelación en cada `booking` (`cancelled_at`), que ya está contemplado en `DATABASE.md`.

## Qué revisar antes de dar cualquier tarea por terminada

Este documento se apoya en `AI_REVIEW_CHECKLIST.md`, que convierte estas reglas en una lista de comprobación concreta y accionable en cada tarea. Si en algún momento una funcionalidad nueva toca datos personales o de menores de una forma no prevista aquí, se para y se documenta la decisión en `DECISIONS.md` antes de continuar — no se improvisa sobre datos reales de personas.
