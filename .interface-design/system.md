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

## Pendiente / deliberadamente fuera de esta pasada

- Panel de admin: solo recibió el barrido mecánico de tokens (colores), no una revisión de jerarquía/composición dedicada.
- Modo oscuro: fuera de alcance del MVP (`AI/PROJECT_CONTEXT.md`) — no se ha construido ninguna variante oscura de estos tokens.
