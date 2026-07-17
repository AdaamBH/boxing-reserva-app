# TESTING.md

## Herramientas

| Nivel | Herramienta | Para qué |
|---|---|---|
| Unitario / componente | Vitest + React Testing Library | Funciones puras, hooks, componentes aislados |
| End-to-end (E2E) | Playwright | Flujos completos, de principio a fin, como los viviría un alumno real |

## Qué se prueba en cada nivel

### Unitario
- Funciones puras de `utils/` (formateo de fechas, cálculo de plazas restantes).
- Hooks de negocio aislados (ejemplo: "¿puede este usuario reservar esta sesión?").
- Componentes de UI en aislamiento (¿se muestra el estado de "clase llena" correctamente dado un aforo lleno?).

### Integración
- Interacción real contra el Supabase local (CLI), no mocks, para las funciones atómicas de reserva/cancelación — precisamente porque su corrección depende del comportamiento real de Postgres (bloqueos, transacciones), un mock nunca lo demostraría de verdad.

### End-to-end (Playwright) — los flujos que no pueden fallar

Estos son los flujos de negocio críticos; cada uno tiene que tener un test E2E antes de considerarse terminado el proyecto (no necesariamente desde la Fase 1, pero sí antes de `TASK_WORKFLOW.md` Fase 7):

1. **Registro → verificación de email → login.**
2. **Reserva de una plaza libre** (camino feliz).
3. **Reserva cuando la clase está llena → entra en lista de espera**, no en la clase.
4. **Dos reservas simulateneous para la última plaza** → una se confirma, la otra va a lista de espera (nunca las dos confirmadas) — este es el test más importante de todo el proyecto, es la prueba directa de que el control de aforo funciona.
5. **Cancelación dentro del plazo permitido** (más de 1 hora antes) → se cancela y, si había lista de espera, se promociona automáticamente al siguiente.
6. **Intento de cancelación fuera de plazo** (menos de 1 hora antes) → se rechaza con un mensaje claro.
7. **Padre/madre gestionando la reserva de un dependiente** (hijo/a menor).

## En qué dispositivos probar

Mobile-first significa que el móvil no es "también hay que verlo en móvil" — es el objetivo principal:

- **Prioridad 1:** viewport móvil (Chrome DevTools como mínimo durante desarrollo; un móvil Android real antes de cerrar cada fase).
- **Prioridad 2:** Safari en iOS — motor de renderizado distinto (WebKit), y es donde más sorpresas suelen aparecer si solo se prueba en Chrome.
- **Prioridad 3:** escritorio — el admin puede usarlo desde ordenador, así que también se comprueba, pero no es el caso de uso principal.

Cuando se llegue a la fase de empaquetado con Capacitor, se añade prueba explícita dentro del contenedor nativo (no solo en el navegador), porque el comportamiento dentro de una WebView empaquetada puede diferir sutilmente del navegador normal.

## Qué NO se persigue en el MVP

- Cobertura de código al 100% — es un objetivo vanidoso que no garantiza calidad. Se prioriza cubrir bien los flujos críticos de negocio (arriba) sobre perseguir un porcentaje.
- Tests de carga/rendimiento con miles de usuarios simulados — prematuro para el tamaño actual del gimnasio; se revisita si el proyecto escala de verdad (ver `ARCHITECTURE.md`, roadmap de escalabilidad).
