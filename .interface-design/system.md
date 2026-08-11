# Sistema de diseño — Gimnasio de boxeo

## Dirección y sensación

El mundo de un gimnasio de boxeo real, no una plantilla SaaS genérica: lona/canvas cálido, cuero oxblood, cuerda de rin, tiza. Confiado y disciplinado, ligeramente curtido — pero legible y de fiar (hay menores y pagos de por medio). No es una app de bienestar/yoga (nada de pasteles suaves ni excesivo redondeo).

Confirmado con el cliente el 2026-08-08 (ver `AI/DECISIONS.md`).

## Paleta (`src/styles/index.css`, bloque `@theme`)

Un único matiz cálido (~55-80° en oklch) para todos los neutros — nunca gris frío desconectado del acento. Un único acento (`brand`, cuero oxblood, ya existía antes de esta pasada). `rope` es el acento secundario (cuerda de rin), reservado para "en espera"/estados secundarios.

| Token | Uso |
|---|---|
| `canvas` | Fondo de página |
| `canvas-raised` | Tarjetas, superficies elevadas un paso |
| `chalk` | Superficies hundidas: inputs, selects |
| `ink` / `ink-muted` / `ink-faint` | Texto primario / secundario / terciario |
| `line` / `line-strong` | Bordes por defecto / con más presencia |
| `brand-500/600/700` | Acento único: botones primarios, enlaces, elementos activos |
| `rope` / `rope-soft` | Acento secundario: "en espera", chips de nivel |
| `success-500` / `warning-500` / `danger-500` | Estados de negocio (ya existían) |

Nunca `slate-*`, `white`, `red-*`, `emerald-*`, `rose-*` literales de Tailwind — todo pasa por estos tokens.

## Tipografía

- **Oswald** (condensada, cartel de combate) para `h1`-`h4` — aplicado automáticamente vía CSS global (`src/styles/index.css`), no hace falta añadir `font-display` a mano.
- **Work Sans** para el cuerpo (`font-sans`, ya es el valor por defecto de `body`).
- Cargadas vía Google Fonts en `index.html` (`preconnect` + `<link>`).

## Profundidad

Bordes sutiles (`border-line`) + sombra suave en capas para tarjetas que "flotan" (`ClassSessionCard`, ver el valor exacto ahí — tres capas, ring de 1px + dos difuminados). No mezclar con sombras duras ni con bordes gruesos.

## Espaciado y radio

Base de 4px (escala de Tailwind por defecto). Tarjetas: `rounded-xl`. Inputs/botones: `rounded-lg`. Insignias/chips: `rounded-full`.

## Firma visual: `CapacityTally`

`src/features/bookings/components/CapacityTally.tsx` — un círculo por plaza (relleno `brand-600` = ocupada, contorno `line-strong` = libre), como una tarjeta de puntuación de asalto. Se usa en `ClassSessionCard`. El mismo lenguaje (círculo relleno vs. contorno) se repite en los "dorsales" numerados de `SessionRosterList` (confirmados en `brand`, lista de espera en `rope`) — mismo signo visual, dos contextos.

## Navegación (`src/app/AppShell.tsx`)

Barra de pestañas fija abajo en móvil (uso real: de pie en el gimnasio), nav horizontal en cabecera a partir de `md:`. Iconos de línea propios en `src/components/icons.tsx` (sin librería de iconos instalada) — `stroke="currentColor"`, heredan el color activo/inactivo del `NavLink` que los envuelve, no llevan color propio.

## Componentes clave

- `Button` primary — `min-h-11` · `px-4 py-2.5` · `rounded-lg` · `text-base font-medium` · `bg-brand-600` · `active:scale-[0.97]` (feedback de pulsación, sin cambio de fondo en `:active`).
- `TextField`/`SelectField` — fondo `bg-chalk` (superficie hundida, no blanco), borde `border-line-strong`, foco `ring-brand-600` (o `ring-danger-500` en error).
- `AuthLayout` (`src/features/auth/components/AuthLayout.tsx`) — envoltorio compartido de las 4 pantallas de auth: wordmark pequeño arriba + tarjeta elevada (mismo patrón de sombra que `ClassSessionCard`) con el `h1`. Cualquier pantalla nueva de auth debe usarlo, no repetir el `min-h-dvh flex ... justify-center` a mano.
- Encabezados de página (`h1` de nivel de sección: "Clases disponibles", "Mis reservas", "Panel de administración"...) — siempre `text-2xl font-semibold tracking-wide text-ink uppercase`. Excepción deliberada: el `h1` de `SessionRosterPage` es el nombre real de la sesión, no una etiqueta de sección, pero sigue el mismo tratamiento visual por consistencia con el resto de titulares.
- Estados binarios tipo "activa/inactiva" (`ClassTemplateListItem`) — `bg-success-500/15 text-success-500` para el estado positivo, `bg-chalk text-ink-faint` para el neutro. No usar `emerald-*`/`green-*` de Tailwind directamente.
- Iconos de línea (`src/components/icons.tsx`): `CalendarIcon`, `ChecklistIcon`, `PeopleIcon`, `ShieldIcon`, `LogoutIcon`, `RepeatIcon`, `BarsIcon`, `EnvelopeIcon`. Añadir aquí cualquier icono nuevo, mismo estilo (`stroke="currentColor"`, `strokeWidth="1.8"`, formas simples).
- `Reveal` (`src/components/Reveal.tsx`, sobre `src/hooks/useScrollReveal.ts`) — fade + 12px de desplazamiento (`translate-y-3` → `translate-y-0`) al entrar en el viewport, 500ms `ease-out`, con `delayMs` para escalonar varios elementos. Respeta `prefers-reduced-motion` y entornos sin `IntersectionObserver` (muestra el contenido directo, sin animar). Solo `transform`/`opacity`. Único uso hasta ahora: `LandingPage`.

## Landing page (`src/features/marketing/`)

Primera pieza pública de la app — antes `/` era un redirect directo a `/clases`, no existía ninguna landing (ver `AI/DECISIONS.md`). `LandingPage` comprueba sesión: autenticado → redirige a `/clases` sin mostrar marketing; sin sesión → `LandingHeader` + `LandingHero` + `LandingFeatures` + `LandingHowItWorks` + `LandingCta` + `LandingFooter`. Reutiliza `CapacityTally` con datos de ejemplo marcados como tales en el hero — la firma visual de la app demostrando su propia ventaja (aforo real), no una promesa de marketing sin más.

- `LandingCtaButton` (`src/features/marketing/components/LandingCtaButton.tsx`) — `Link` con pinta de botón, `variant` (`primary`/`secondary`) × `size` (`sm` para el header, `lg` para hero/CTA final). Único sitio que define esas clases; los 3 CTA de la landing lo reutilizan en vez de repetir la cadena de utilidades.
- `.bg-canvas-texture` (`src/styles/index.css`) — trama cruzada al 3.5% de opacidad sobre `ink`, evoca el tejido de la lona del ring. Solo en las secciones "bookend" de la landing (`LandingHero`, `LandingCta`); nunca en pantallas de la app real, donde el fondo se mantiene plano a propósito.
- Conector de "cuerda de rin" en `LandingHowItWorks`: línea discontinua (`border-dashed border-rope/50`) uniendo los 3 pasos numerados en `sm:` — mismo lenguaje visual que `CapacityTally`/los dorsales, aplicado como elemento estructural en vez de solo como color de estado.
- `LandingFeatures` ya no es una rejilla 2×2 de tarjetas idénticas: la primera feature ("Aforo real, sin sorpresas", el diferenciador real del proyecto) tiene tratamiento propio más ancho/grande; las otras tres quedan como fila de apoyo debajo. Jerarquía real en vez de 4 cajas del mismo peso.
- Footer con 3 puntos de confianza reales (aforo en tiempo real, cancelación 1h, RGPD/menores) — hechos ya documentados en `AI/PROJECT_CONTEXT.md`/`SECURITY.md`, no reclamos de marketing inventados.

## Estados de carga: `Skeleton`

`src/components/Skeleton.tsx` — bloque `animate-pulse bg-chalk`, sin más lógica. Se compone en skeletons con la silueta exacta del componente real (`ClassSessionCardSkeleton` en `features/classes/components`, `BookingListItemSkeleton` en `features/bookings/components`) para que las listas no salten al llegar los datos — sustituye a un simple texto "Cargando…" en `ReservasPage` y `MyBookingsPage`. Siempre con un `<span className="sr-only">` describiendo el estado y `aria-busy="true"` en el contenedor, para no perder el aviso accesible que sí daba el texto.

## Pendiente / deliberadamente fuera de esta pasada

- Modo oscuro: fuera de alcance del MVP (`AI/PROJECT_CONTEXT.md`) — no se ha construido ninguna variante oscura de estos tokens.
- Landing: sin fotografía real del gimnasio ni testimonios (no fabricados a propósito) — añadir cuando exista contenido real. Sin dirección/horario reales en el footer por el mismo motivo.
- Skeletons de carga: cubiertos `ReservasPage` y `MyBookingsPage` (las dos pantallas de mayor uso); `SessionRosterPage`/`TrainersPage`/admin siguen con texto "Cargando…" simple — extender si se detecta que importa ahí.
