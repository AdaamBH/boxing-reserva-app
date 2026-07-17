# PROJECT_CONTEXT.md

> Documento de referencia rápida. Si solo vas a leer un archivo antes de tocar código, es este.

## Qué es

Aplicación multiplataforma (web + móvil) para la gestión de **[Nombre del Gimnasio]**, un gimnasio de boxeo con sede única en España (zona de Toledo). Sustituye la gestión manual/informal de reservas de clases (WhatsApp, papel, llamadas) por un sistema digital con control de aforo real, lista de espera automática y cancelaciones autogestionadas.

> Nota: "[Nombre del Gimnasio]" es un placeholder. En cuanto tengas nombre y logo definitivos, se actualiza aquí y en la configuración de marca (ver `ARCHITECTURE.md`, sección de theming).

Es un proyecto **real, para un cliente real** (no un ejercicio académico), aunque nace en paralelo a tu formación en DAM. Eso significa: los datos que va a manejar son datos reales de personas (incluyendo menores de edad), y el nivel de cuidado en seguridad y protección de datos no es opcional ni "para nota" — es responsabilidad legal real frente a RGPD/LOPDGDD.

## Para quién

| Rol | Quién es | Qué hace en la app |
|---|---|---|
| **Alumno** | Persona inscrita en el gimnasio (o su padre/madre/tutor si es menor) | Se registra, reserva plazas en clases, se apunta a listas de espera, cancela reservas, ve su perfil y el de sus dependientes (hijos menores) |
| **Entrenador** | Instructor del gimnasio | Ficha informativa (nombre, foto, bio, especialidad). No inicia sesión en el MVP — lo gestiona el admin |
| **Administrador** | Gestión del gimnasio | Crea/edita clases, gestiona entrenadores, ve reservas, cancela clases cuando haga falta |

No existe (por ahora) un rol de "Dueño" separado del admin — se decidió mantenerlo simple.

## El problema que resuelve

Un gimnasio con "bastantes alumnos" gestionando el aforo de sus clases sin sistema digital tiene problemas conocidos: no hay forma fiable de saber cuántas plazas quedan libres en el momento, no hay lista de espera automática (se pierde gente que habría ocupado una plaza liberada), y las cancelaciones de última hora se comunican de forma ad-hoc. Esta app resuelve específicamente:

1. **Aforo controlado con precisión** — nunca se reserva una plaza que no existe, ni aunque dos alumnos reserven en el mismo instante.
2. **Lista de espera con promoción automática** — si se libera una plaza, entra automáticamente el primero en la cola (FIFO), sin que nadie tenga que estar pendiente.
3. **Cancelación autogestionada** — el alumno cancela desde la app hasta 1 hora antes de la clase, sin llamar a nadie.
4. **Gestión de menores** — un padre/madre puede gestionar la reserva de su hijo/a menor desde su propia cuenta, sin que el menor necesite cuenta propia.

## Qué NO hace (fuera de alcance del MVP)

Esto es tan importante como lo que sí hace — evita que la primera versión crezca sin control (principio YAGNI del proyecto):

- **No gestiona pagos ni cuotas.** La mensualidad se paga fuera de la app (en persona, transferencia, etc.). La app solo gestiona plazas. Se deja la puerta abierta a integrar pagos en el futuro (ver `ARCHITECTURE.md`).
- **No es multi-sede.** Un único gimnasio. El modelo de datos no necesita (de momento) un concepto de "sede".
- **No tiene panel de analíticas/reportes avanzado.** El panel de admin es deliberadamente sencillo en el MVP; reportes de ocupación/asistencia quedan para fase 2.
- **No tiene notificaciones push.** Todo lo transaccional va por email en el MVP.
- **No tiene modo oscuro.** Solo modo claro en el MVP (pero el sistema de estilos se construye desde el principio para que añadirlo después sea trivial, no una reescritura).
- **No penaliza cancelaciones tardías.** Solo existe el límite de 1 hora antes de la clase; no hay sistema de sanciones.
- **No está publicada en tiendas de apps todavía.** Se construye para que ese paso (Google Play, y App Store si se decide más adelante) sea una empaquetada final con Capacitor, no una reescritura.

## Filosofía del proyecto

Estos principios, que tú mismo marcaste, son la vara de medir para cualquier decisión técnica que tomemos a partir de ahora:

- **Calidad antes que velocidad.** El plazo es amplio a propósito: preferimos hacerlo bien a hacerlo rápido.
- **Mantenibilidad antes que escribir menos código.** Un poco más de código explícito y legible gana a una abstracción prematura difícil de seguir.
- **Seguridad desde el diseño.** No se añade "al final" — cada tabla nueva nace con sus reglas de Row Level Security definidas, cada input se valida antes de tocar la base de datos.
- **Mobile-first sin excepción.** Se diseña primero para el móvil (uso principal de los alumnos) y se adapta hacia arriba, nunca al revés.
- **Simplicidad antes que complejidad innecesaria (KISS/YAGNI).** No se introduce una herramienta o abstracción hasta que hay una necesidad real y presente, no hipotética.
- **Escalabilidad pensada, no sobre-diseñada.** Se eligen tecnologías y patrones que aguantan miles de usuarios sin reescritura, pero no se optimiza prematuramente para escenarios que no van a darse pronto.

## Contexto de negocio (resumen)

- **Ubicación/jurisdicción:** España (zona de Toledo) → aplica RGPD (Reglamento europeo) y su desarrollo español, la LOPDGDD. Ver `SECURITY.md` para el detalle, especialmente en lo relativo a menores.
- **Plazo:** amplio, sin fecha de entrega fija — prioridad en hacerlo bien.
- **Presupuesto:** cero por ahora, con capacidad de añadir pagos a servicios (hosting, email, etc.) en el futuro. Todo el stack elegido tiene un nivel gratuito real, no una prueba de 14 días.
- **Equipo:** desarrollador único (tú), con este espacio de trabajo actuando como el resto del equipo técnico (arquitectura, seguridad, revisión de código).

## Documentos relacionados

Este archivo es el punto de entrada. Para profundizar:

- **`ARCHITECTURE.md`** — stack completo, estructura de carpetas, decisiones técnicas y por qué.
- **`DATABASE.md`** — esquema de datos, relaciones, cómo se controla el aforo sin condiciones de carrera.
- **`SECURITY.md`** — autenticación, autorización, y el tratamiento específico de datos de menores.
- **`TASK_WORKFLOW.md`** — en qué orden se construye todo esto.
- **`DECISIONS.md`** — registro de decisiones técnicas que se tomen a partir de ahora y que no estaban previstas aquí.
