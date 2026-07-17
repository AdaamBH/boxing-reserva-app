# CODE_STYLE.md

Convenciones concretas. Si tienes dudas de "¿cómo nombro esto?" o "¿dónde va este archivo?", la respuesta está aquí. Lo que no está permitido, está marcado como tal — no es una sugerencia.

## TypeScript estricto

`tsconfig.json` con, como mínimo:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- **`any` prohibido.** Si de verdad no se puede tipar algo (por ejemplo, una respuesta externa impredecible), se usa `unknown` y se valida con Zod antes de usarlo — nunca se hace un cast a `any` "para que compile".
- **`@ts-ignore` prohibido sin comentario justificando el motivo en la línea anterior.** Ejemplo aceptable: `// @ts-ignore: librería X no tiene tipos, issue abierto en su repo` — sin comentario, no se aprueba en revisión.

## Nombres

| Qué | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ClassCard.tsx`, `BookingButton.tsx` |
| Hooks | camelCase con prefijo `use` | `useClassSessions.ts` |
| Funciones y variables | camelCase | `formatSessionTime`, `remainingSpots` |
| Tipos e interfaces | PascalCase | `ClassSession`, `BookingResult` |
| Constantes globales | UPPER_SNAKE_CASE | `MAX_CANCELLATION_HOURS` |
| Tablas y columnas de base de datos | snake_case en inglés | `class_sessions`, `parent_user_id` |

**Idioma de los identificadores: inglés siempre**, aunque el proyecto y su documentación estén en español. Es el estándar profesional (las librerías, la documentación técnica y la mayoría de futuros colaboradores lo esperan así), y evita mezclar dos idiomas dentro del propio código (`reservarClase` junto a `useEffect` es peor que tener todo en inglés). El español se reserva para: comentarios explicativos, texto que ve el usuario final, y toda la documentación de `AI/`.

## Componentes

- **Máximo ~150 líneas por componente.** Si se pasa, es una señal de que hace más de una cosa — se separa en sub-componentes o se extrae lógica a un hook.
- **Responsabilidad única.** Un componente que reserva Y muestra el listado Y gestiona el modal de confirmación son tres componentes, no uno.
- Un componente de React, un archivo. No se agrupan varios componentes no relacionados en el mismo archivo aunque sean pequeños.
- Props tipadas siempre con una `interface` (no `type` para props, por consistencia): `interface ClassCardProps { session: ClassSession; onBook: () => void }`.
- Sin lógica de negocio dentro del JSX de un componente — si hay un cálculo (por ejemplo, "cuántas plazas quedan libres"), vive en una función o hook, no en línea dentro del render.

## Imports con alias

Configurado en `vite.config.ts` y `tsconfig.json`:

```ts
"@/*": ["./src/*"]
```

- ✅ `import { ClassCard } from '@/features/classes/components/ClassCard'`
- ❌ `import { ClassCard } from '../../../features/classes/components/ClassCard'`

Una ruta relativa con más de un `../` está prohibida — si necesitas subir más de un nivel, usa el alias.

## Prohibido en cualquier código que llegue a `main`

- `console.log` (usar un logger mínimo solo si hace falta depurar temporalmente, y quitarlo antes de abrir el Pull Request — nunca llega a `main`).
- `any` sin justificar (ver arriba).
- Lógica de negocio duplicada entre el frontend y una Edge Function sin extraerla a un esquema/función compartida.
- Estilos con valores "mágicos" sueltos (`margin-top: 13px`) en vez de la escala de espaciado de Tailwind.
- Comentarios que describen "qué" hace el código línea a línea (el código ya lo dice); sí se valoran los comentarios que explican "por qué" se ha tomado una decisión no obvia.

## Principios aplicados con ejemplos de este proyecto

- **SRP (responsabilidad única):** `useClassSessions` solo trae y cachea sesiones; la lógica de "¿puedo reservar esta sesión?" (por rol, por si ya tengo reserva) vive en una función separada, no mezclada dentro del hook de datos.
- **DRY:** el esquema de Zod de "datos de un dependiente" se define una vez y lo usan tanto el formulario de alta como la Edge Function que lo valida en el servidor.
- **KISS:** antes de añadir una librería nueva para resolver algo, se comprueba si React/TypeScript/Tailwind ya lo resuelven con código simple.
- **YAGNI:** no se construye "por si acaso en el futuro hace falta" (ejemplo: no se añade ahora soporte multi-sede en el modelo de datos, porque confirmaste que es un único gimnasio).

## Formateo

- **ESLint + Prettier**, configuración compartida en el repositorio (no configuración personal de editor). Se ejecutan automáticamente antes de cada commit (ver `ENGINEERING_RULES.md`, hook de pre-commit).
- Comillas simples y punto y coma al final de cada sentencia, fijado explícitamente en `.prettierrc.json` (el default real de Prettier es comillas dobles — no asumir el default, dejarlo escrito). Una vez configurado, no se discute manualmente en revisión: lo decide la herramienta.

## Mobile-first en estilos

- Se escribe siempre la clase de Tailwind base pensando en pantalla pequeña primero, y se añaden variantes (`md:`, `lg:`) para pantallas mayores — nunca al revés (`lg:flex md:hidden` invertido rompe el principio).
- Ningún componente nuevo se da por terminado sin comprobar su aspecto en un viewport de móvil real o emulado (ver `AI_REVIEW_CHECKLIST.md`).
