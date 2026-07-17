# TASK_WORKFLOW.md

## Entornos

| Entorno | Dónde vive | Para qué |
|---|---|---|
| **Local** | Supabase CLI + Docker en tu máquina | Desarrollo del día a día. Ilimitado, sin riesgo de pausa por inactividad, sin gastar tu cupo de proyectos cloud gratuitos. |
| **Producción** | Proyecto cloud de Supabase (1 de los 2 gratuitos) + Vercel | La app real, con datos reales de alumnos. |
| **Staging** *(cuando el proyecto lo justifique)* | El segundo proyecto cloud gratuito de Supabase | Probar antes de pasar a producción, especialmente en dispositivo móvil real antes de una publicación en tienda. No hace falta desde el primer día — se activa cuando empiece a doler no tenerlo. |

Detalle completo de configuración en `DEPLOYMENT.md`.

## Fases del proyecto

El orden importa: cada fase se apoya en la anterior. No se empieza una fase sin que la anterior pase `AI_REVIEW_CHECKLIST.md`.

### Fase 0 — Cimientos
- Repositorio (ya existe: `boxing-reserva-app`), estructura de carpetas base (`ARCHITECTURE.md`), configuración de TypeScript estricto, ESLint, Prettier.
- Proyecto de Supabase (local + cloud de producción).
- Proyecto de Vercel conectado al repositorio.
- CI básico en GitHub Actions (lint + typecheck en cada PR).

### Fase 1 — Autenticación y perfiles
- Registro, login, verificación de email, recuperación de contraseña.
- Tabla `profiles`, RLS básica.
- Alta de dependientes (hijos menores) desde la cuenta de un padre/madre.

### Fase 2 — Clases (lectura)
- Modelo `class_templates` / `class_sessions` (`DATABASE.md`).
- Listado de clases disponibles con horario, nivel, entrenador, plazas.
- Perfiles de entrenadores (contenido informativo).
- Panel de admin: crear/editar plantillas de clases y sesiones sueltas (versión sencilla, según acordado).

### Fase 3 — Reservas y aforo
- Función atómica `book_class_session` (la pieza más delicada del proyecto — no se avanza a la fase 4 sin tests que demuestren que dos reservas simultáneas para la última plaza se resuelven correctamente).
- Lista de espera: alta automática cuando la sesión está llena.

### Fase 4 — Cancelaciones y promoción automática
- Función atómica `cancel_booking` con el límite de 1 hora.
- Promoción automática del primero en la lista de espera.

### Fase 5 — Emails transaccionales
- Integración de Resend vía Edge Functions.
- Configuración de Supabase Auth para usar Resend como SMTP (verificación, recuperación de contraseña) en vez del servicio de pruebas por defecto.
- Emails de lista de espera y cancelación.

### Fase 6 — Pulido y PWA
- Manifest y service worker (instalable, funciona con conectividad limitada para lo esencial).
- Revisión completa de mobile-first en todas las pantallas.

### Fase 7 — Testing y salida a producción
- Suite E2E de los flujos críticos (`TESTING.md`).
- Checklist de `DEPLOYMENT.md` (RLS verificada en todas las tablas, variables de entorno de producción, backup manual programado).

### Fase 8 (futuro, fuera del MVP)
- Empaquetado con Capacitor y publicación en Google Play (y App Store si se decide).
- Pagos dentro de la app.
- Modo oscuro.
- Reportes/analíticas en el panel de admin.
- Notificaciones push.

Cada vez que se cierre una fase, es un buen momento para revisar si algo de lo documentado en `AI/` se ha quedado corto frente a la realidad — y si es así, se actualiza el documento correspondiente, no se deja la documentación desactualizada "para más adelante".
