# CONTRIBUTING.md

Aunque trabajas en solitario, este documento existe por dos motivos: para que tú mismo puedas volver a montar el entorno desde cero sin depender de memoria, y porque es exactamente el documento que necesitaría cualquier otra persona (o IA) que se incorpore al proyecto más adelante.

## Requisitos previos

- **Node.js** (versión LTS más reciente — se recomienda gestionarlo con `nvm` para poder cambiar de versión fácilmente si un futuro proyecto lo necesita).
- **Docker Desktop** (necesario para correr Supabase en local).
- **Cuenta de GitHub** (ya la tienes, repositorio `boxing-reserva-app`).
- **Supabase CLI** (`npm install -g supabase`).

## Puesta en marcha desde cero

```bash
# 1. Clonar el repositorio
git clone https://github.com/AdaamBH/boxing-reserva-app.git
cd boxing-reserva-app

# 2. Instalar dependencias
npm install

# 3. Copiar las variables de entorno de ejemplo y rellenarlas
cp .env.example .env

# 4. Arrancar Supabase en local (requiere Docker en marcha)
supabase start
# Esto imprime por terminal la URL y anon key locales -> van en tu .env local

# 5. Aplicar las migraciones existentes a tu base de datos local
supabase db reset

# 6. Arrancar la aplicación
npm run dev
```

## Scripts principales

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca el servidor de desarrollo (Vite) |
| `npm run build` | Genera la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Verifica TypeScript sin generar archivos (`tsc --noEmit`) |
| `npm run test` | Ejecuta los tests unitarios/integración (Vitest) |
| `npm run test:e2e` | Ejecuta los tests End-to-End (Playwright) |
| `supabase start` / `supabase stop` | Levanta/para el entorno local de Supabase |
| `supabase db reset` | Reaplica todas las migraciones desde cero en local |

## Ramas y commits

Ver `ENGINEERING_RULES.md` para el detalle completo: ramas por funcionalidad (`feature/...`, `fix/...`), Pull Request hacia `main` incluso trabajando solo, Conventional Commits.

## Antes de hacer commit

Se recomienda configurar un hook de pre-commit (por ejemplo con `husky` + `lint-staged`) que ejecute automáticamente lint y formateo sobre los archivos modificados — evita que llegue a `main` código que no cumple `CODE_STYLE.md` por un despiste.

## Si algo de esto queda desactualizado

Este documento describe el setup en el momento en que se escribió. Si en algún momento el proceso real de puesta en marcha diverge de lo que dice aquí, se actualiza este archivo como parte de la misma tarea que introdujo el cambio — no se deja para después.
