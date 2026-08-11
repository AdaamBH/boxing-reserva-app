# PRD — App de Reservas para Gimnasio de Boxeo

> Product Requirements Document. Fuente de verdad de negocio; el detalle técnico vive en el resto de `AI/*.md` (ver tabla de referencias al final). Este documento resume el "qué" y el "por qué"; los demás cubren el "cómo".

**Estado:** MVP en desarrollo (Fase 1–2 según `TASK_WORKFLOW.md`)
**Última actualización:** 2026-08-08

---

## 1. Resumen ejecutivo

Aplicación multiplataforma (web + móvil) de gestión de reservas para **[Nombre del Gimnasio]**, un gimnasio de boxeo con sede única en la zona de Toledo, España. Sustituye la gestión manual de reservas (WhatsApp, papel, llamadas) por un sistema digital con:

- Control de aforo real y sin condiciones de carrera.
- Lista de espera con promoción automática (FIFO).
- Cancelaciones autogestionadas por el propio alumno.
- Gestión de menores de edad a través de la cuenta de su padre/madre.

Es un proyecto real para un cliente real. Los datos incluyen menores de edad, por lo que el cumplimiento de RGPD/LOPDGDD es un requisito legal obligatorio, no una mejora opcional.

## 2. Problema

Un gimnasio que gestiona el aforo de sus clases sin sistema digital tiene problemas conocidos y recurrentes:

1. No hay forma fiable de saber en tiempo real cuántas plazas quedan libres.
2. No existe lista de espera automática — cuando alguien cancela, se pierde la oportunidad de avisar al siguiente en la cola.
3. Las cancelaciones de última hora se comunican de forma ad-hoc (WhatsApp, llamadas), generando fricción tanto para el alumno como para el gimnasio.
4. No hay un modelo claro para gestionar la reserva de menores de edad sin darles una cuenta propia.

## 3. Objetivos del MVP

| Objetivo | Cómo se mide |
|---|---|
| Eliminar el overbooking | Cero clases con más reservas confirmadas que aforo máximo, incluso bajo reservas simultáneas para la última plaza |
| Reducir la fricción de reserva/cancelación | Un alumno puede reservar o cancelar sin intervención humana, en menos de 1 minuto |
| Automatizar la lista de espera | Promoción del primer alumno en cola ocurre sin intervención manual al liberarse una plaza |
| Cumplir RGPD/LOPDGDD desde el diseño | RLS activa en el 100% de las tablas con datos personales; consentimiento explícito para menores |

## 4. Usuarios y roles

| Rol | Quién es | Qué hace en la app |
|---|---|---|
| **Alumno** | Persona inscrita en el gimnasio, o su padre/madre/tutor si es menor | Se registra, reserva plazas en clases, se apunta a listas de espera, cancela reservas, ve su perfil y el de sus dependientes |
| **Entrenador** | Instructor del gimnasio | Ficha informativa (nombre, foto, bio, especialidad). No inicia sesión en el MVP — lo gestiona el admin |
| **Administrador** | Gestión del gimnasio | Crea/edita clases y entrenadores, ve todas las reservas, cancela clases cuando haga falta |

No existe un rol de "Dueño" separado del admin — se mantiene simple a propósito.

## 5. Alcance del MVP

### 5.1 Funcionalidades incluidas

- **Autenticación:** registro, login, verificación de email obligatoria antes de reservar, recuperación de contraseña (Supabase Auth).
- **Perfiles:** datos básicos del alumno; alta de dependientes (hijos menores) desde la cuenta del padre/madre, con consentimiento explícito.
- **Catálogo de clases:** listado de clases disponibles (horario, nivel, entrenador, plazas libres), perfiles informativos de entrenadores.
- **Reservas:** reserva atómica sin condiciones de carrera (`book_class_session`), reserva para uno mismo o para un dependiente.
- **Lista de espera:** alta automática cuando la sesión está llena; orden FIFO.
- **Cancelaciones:** el alumno cancela hasta 1 hora antes de la clase (`cancel_booking`); promoción automática del primero en la lista de espera al liberarse una plaza.
- **Emails transaccionales:** confirmación/cancelación de reserva, aviso de promoción desde lista de espera (vía Resend + Edge Functions).
- **Panel de administración (sencillo):** CRUD de clases (plantillas y sesiones sueltas), gestión de entrenadores, visibilidad de todas las reservas, cancelación de sesiones.
- **PWA:** instalable, funcionalidad esencial disponible con conectividad limitada.

### 5.2 Explícitamente fuera de alcance del MVP

Tan importante como lo anterior — evita que el MVP crezca sin control (YAGNI):

- **Sin pagos ni cuotas.** La mensualidad se paga fuera de la app. Se deja la puerta abierta a integrarlo en el futuro.
- **Sin multi-sede.** Un único gimnasio; el modelo de datos no contempla "sede".
- **Sin panel de analíticas/reportes avanzado.** Reportes de ocupación/asistencia quedan para fase 2.
- **Sin notificaciones push.** Todo lo transaccional va por email.
- **Sin modo oscuro.** Solo modo claro (el sistema de estilos se construye para que añadirlo después sea trivial).
- **Sin penalización por cancelación tardía.** Solo existe el límite de 1 hora; no hay sistema de sanciones.
- **Sin publicación en tiendas de apps todavía.** Se construye para que empaquetarlo con Capacitor sea un paso final, no una reescritura (Fase 8).

## 6. Requisito crítico: control de aforo sin condiciones de carrera

El problema técnico más delicado del proyecto. La forma ingenua de reservar ("contar reservas confirmadas, si hay hueco insertar") falla cuando dos alumnos reservan la última plaza en el mismo instante: ambas peticiones pueden ver "hay hueco" antes de que ninguna haya insertado nada, y el aforo se supera.

La solución vive en la base de datos, no en el código de la aplicación:

- `book_class_session` y `cancel_booking` son funciones atómicas en PostgreSQL (`plpgsql`) que usan `SELECT ... FOR UPDATE` para bloquear la fila de la sesión durante toda la transacción. Dos reservas simultáneas para la misma sesión quedan en fila, no en paralelo.
- Nunca se hace un `INSERT` directo desde el cliente para `bookings` o `waitlist_entries` — RLS lo bloquea a propósito; todo pasa por estas funciones.
- El test E2E de "dos reservas simultáneas para la última plaza" se considera el test más importante de todo el proyecto (ver `AI/TESTING.md`).

Detalle completo del modelo de datos y la implementación en `AI/DATABASE.md`.

## 7. Menores de edad y RGPD/LOPDGDD

- Un menor no tiene cuenta propia. Toda su relación con el sistema pasa por `parent_user_id` (tabla `dependents`).
- La LOPDGDD (art. 7) fija en España en 14 años la edad mínima para que una persona dé su propio consentimiento sobre sus datos. Por debajo, el tratamiento solo es lícito con el consentimiento del titular de la patria potestad.
- Cuando un padre/madre reserva "para su hijo", el `booking` guarda `user_id` (quién actuó) y `dependent_id` (para quién es la plaza) — trazabilidad de responsabilidad separada del beneficiario.
- El formulario de alta de un dependiente debe dejar explícito el consentimiento sobre el tratamiento de los datos del menor — no un checkbox genérico de términos.
- No se recogen de los dependientes más datos que nombre, apellidos, fecha de nacimiento y relación. Nada de datos económicos, escolares o de salud.
- RLS activa desde el momento en que se crea cada tabla — una tabla sin RLS es, por defecto, legible/escribible por cualquiera con la clave pública.

Detalle completo en `AI/SECURITY.md`.

## 8. Requisitos no funcionales

| Área | Requisito |
|---|---|
| Seguridad | RLS en el 100% de las tablas con datos personales; Zod compartido entre frontend y Edge Functions; ningún secreto (service role key, API key de Resend) en código de cliente |
| Rendimiento/escala | Debe aguantar miles de usuarios sin reescritura, sin optimización prematura para escenarios que no van a darse pronto |
| Mobile-first | Diseño mobile-first sin excepción — es el uso principal de los alumnos |
| Disponibilidad | HTTPS en todas partes (Vercel + Supabase por defecto) |
| Presupuesto | Cero por ahora; todo el stack elegido tiene un nivel gratuito real, no una prueba de 14 días |
| Mantenibilidad | Se prefiere código explícito y legible sobre abstracción prematura |

## 9. Stack técnico (resumen)

React 19 + TypeScript estricto + Vite · Tailwind CSS v4 · Supabase (Postgres + Auth + RLS + Storage + Edge Functions) · TanStack Query · React Hook Form + Zod · React Router v7 · Capacitor (empaquetado futuro, Fase 8). Justificación completa de cada elección en `AI/ARCHITECTURE.md`.

## 10. Plan de fases

| Fase | Contenido |
|---|---|
| 0 — Cimientos | Repositorio, estructura de carpetas, TS estricto, ESLint/Prettier, proyecto Supabase, proyecto Vercel, CI básico |
| 1 — Autenticación y perfiles | Registro/login/verificación/recuperación, tabla `profiles`, alta de dependientes |
| 2 — Clases (lectura) | `class_templates`/`class_sessions`, listado de clases, perfiles de entrenadores, panel admin básico |
| 3 — Reservas y aforo | `book_class_session` atómica, lista de espera |
| 4 — Cancelaciones | `cancel_booking` con límite de 1h, promoción automática |
| 5 — Emails transaccionales | Resend vía Edge Functions, SMTP de Supabase Auth, emails de lista de espera/cancelación |
| 6 — Pulido y PWA | Manifest, service worker, revisión mobile-first completa |
| 7 — Testing y producción | Suite E2E de flujos críticos, checklist de `DEPLOYMENT.md` |
| 8 (futuro, fuera del MVP) | Capacitor + tiendas de apps, pagos, modo oscuro, analíticas, push |

Detalle en `AI/TASK_WORKFLOW.md`.

## 11. Criterios de éxito del MVP

- Ninguna clase supera su aforo máximo, verificado con test de concurrencia real (dos reservas simultáneas para la última plaza).
- Un alumno puede completar el ciclo reserva → cancelación → promoción de lista de espera sin ayuda humana.
- Un padre/madre puede gestionar la reserva de un hijo menor sin que el menor necesite cuenta propia.
- CI (format, lint, typecheck, test, build) pasa en cada PR antes de mergear a `main`.
- Checklist de `AI/AI_REVIEW_CHECKLIST.md` superado antes de dar por cerrada cualquier tarea que toque datos de usuarios.

## 12. Riesgos conocidos

| Riesgo | Mitigación |
|---|---|
| Condición de carrera en reservas | Funciones atómicas con `FOR UPDATE`, no lógica de aforo en el cliente (ver §6) |
| Exposición de datos de menores | RLS estricta, minimización de datos, consentimiento explícito (ver §7) |
| Tabla nueva sin RLS por descuido | Regla de trabajo fija: ninguna tabla se crea sin política de RLS explícita desde el primer commit |
| Secretos filtrados en cliente | Service role key solo en Edge Functions; `.env` fuera del repo desde el primer commit |

## 13. Fuera de alcance / preguntas abiertas

- Nombre y logo definitivo del gimnasio — placeholder `[Nombre del Gimnasio]` pendiente de sustituir en toda la documentación y el theming.
- Fecha de entrega: sin fecha fija, prioridad en calidad sobre velocidad.
- Fase de staging: se activa cuando el proyecto lo justifique, no desde el día 1.

## 14. Documentos relacionados

| Archivo | Cubre |
|---|---|
| `AI/PROJECT_CONTEXT.md` | Referencia rápida — punto de entrada |
| `AI/ARCHITECTURE.md` | Stack, estructura de carpetas, flujo de datos |
| `AI/DATABASE.md` | Esquema, relaciones, diseño de control de aforo atómico |
| `AI/SECURITY.md` | Auth, RLS, RGPD/LOPDGDD, menores |
| `AI/CODE_STYLE.md` | Convenciones de nombres, reglas de componentes |
| `AI/API_STANDARDS.md` | Convenciones de Edge Functions / RPC |
| `AI/ENGINEERING_RULES.md` | Ramas, commits, manejo de errores |
| `AI/AI_REVIEW_CHECKLIST.md` | Checklist antes de dar una tarea por terminada |
| `AI/TASK_WORKFLOW.md` | Fases del proyecto, orden de construcción |
| `AI/DEPLOYMENT.md` | Infraestructura, variables de entorno, checklist de salida a producción |
| `AI/TESTING.md` | Qué testear, en qué nivel, en qué dispositivos |
| `AI/DECISIONS.md` | Registro de decisiones técnicas no obvias |
