# DEPLOYMENT.md

## Infraestructura

- **Frontend:** Vercel, desplegado directamente desde el repositorio de GitHub (`boxing-reserva-app`).
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions).
- **Email:** Resend.

## Por qué un único proyecto de Supabase para producción (por ahora)

El plan gratuito de Supabase permite **2 proyectos activos** (verificado en julio de 2026 — estas cifras cambian, comprobar en supabase.com/pricing si ha pasado tiempo desde que se escribió esto). En vez de gastar los dos en "desarrollo" y "producción" desde ya, se recomienda:

- **Desarrollo diario → Supabase CLI en local (Docker).** Gratis, ilimitado, no depende de conexión ni cuenta cloud, y sin el riesgo de que un proyecto se pause por inactividad mientras estás aprendiendo y probando cosas a tu ritmo.
- **Un proyecto cloud → producción**, desde el principio.
- **El segundo proyecto cloud gratuito → staging**, cuando el proyecto lo justifique (por ejemplo, antes de la fase de publicación en Google Play, para probar en un dispositivo real contra un backend real sin tocar producción).

Dos límites del plan gratuito a tener muy presentes con datos reales de alumnos:
- **Sin backups automáticos.** Con datos reales de personas, esto no es aceptable a largo plazo sin más — se configura un volcado manual periódico (`supabase db dump`) desde el principio, aunque sea manual, y se reevalúa pasar a un plan de pago (que sí incluye backups) en cuanto el gimnasio dependa realmente de la app en el día a día.
- **El proyecto se pausa tras 7 días sin actividad.** Irrelevante en producción real (los alumnos generan actividad constantemente), pero puede pillarte por sorpresa en un proyecto de staging que no se usa a diario.

## Variables de entorno

Nunca se commitea un `.env` con valores reales — vive en `.gitignore` desde el primer commit del repositorio. Se documenta la lista de variables necesarias en un `.env.example` sin valores:

```
# Cliente (seguro exponer en el frontend — depende de que RLS esté bien configurada)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Solo servidor (Edge Functions) — JAMÁS en código de cliente
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

En Vercel, estas variables se configuran en el panel del proyecto (Settings → Environment Variables), separadas por entorno (Production / Preview / Development) — nunca hardcodeadas en el código.

## Migraciones de base de datos

El esquema de la base de datos vive versionado como código, en `supabase/migrations/`, no se edita "a mano" en el panel de Supabase en producción:

1. Se prueba la migración en local (Supabase CLI).
2. Se sube el archivo de migración al repositorio.
3. Se aplica a producción de forma explícita (`supabase db push` o vía CI), nunca improvisando directamente sobre la base de datos en producción.

## Checklist antes de ir a producción por primera vez (go-live)

- [ ] RLS activada y con políticas explícitas verificadas en **todas** las tablas (repasar tabla por tabla contra `SECURITY.md` — este es el fallo de seguridad más común y más grave en proyectos Supabase).
- [ ] Variables de entorno de producción configuradas en Vercel y en Supabase (Edge Functions), ninguna de desarrollo mezclada.
- [ ] Dominio propio configurado en Resend para el envío de emails (mejora la entregabilidad frente a usar un dominio genérico de pruebas).
- [ ] Supabase Auth configurado para usar Resend como SMTP personalizado (no el servicio de email de pruebas por defecto).
- [ ] Volcado de backup manual probado al menos una vez (saber que funciona antes de necesitarlo de verdad).
- [ ] Prueba manual completa del flujo crítico: registro → verificación → reserva → cancelación → promoción de lista de espera, en un móvil real.

## Enrutado del lado del cliente (`vercel.json`)

React Router hace todo el enrutado en el navegador (`pushState`), pero Vercel sirve el build de Vite como archivos estáticos: sin una regla explícita, una petición **directa** al servidor por una ruta que no es un archivo real (`/clases`, `/mis-reservas`...) devuelve 404 en vez de `index.html`. Esto pasa siempre que el navegador golpea la red en vez de resolver la ruta con el JS ya cargado — recargar la página, escribir la URL a mano, o (en móvil) el sistema operativo descartando la pestaña en segundo plano y recargándola al volver atrás. `vercel.json` en la raíz del repo redirige cualquier ruta a `index.html` para que React Router la resuelva del lado del cliente. Ver `AI/DECISIONS.md` (2026-08-11) para el diagnóstico completo.

## Despliegue continuo

- Cada Pull Request genera automáticamente una URL de preview en Vercel — se prueba ahí antes de fusionar a `main`.
- Cada fusión a `main` despliega automáticamente a producción. Por eso `main` debe estar siempre en un estado desplegable (ver `ENGINEERING_RULES.md`) — no es un entorno de pruebas.
