# boxing-reserva-app

Aplicación multiplataforma (web + móvil) de reserva de clases y gestión para un gimnasio de boxeo en España.

## Antes de tocar nada

Toda la documentación técnica del proyecto vive en [`AI/`](./AI). Empieza por [`AI/PROJECT_CONTEXT.md`](./AI/PROJECT_CONTEXT.md).

| Documento | Para qué |
|---|---|
| [`PROJECT_CONTEXT.md`](./AI/PROJECT_CONTEXT.md) | Qué es, para quién, qué problema resuelve — léelo primero |
| [`ARCHITECTURE.md`](./AI/ARCHITECTURE.md) | Stack, estructura de carpetas, decisiones técnicas y por qué |
| [`DATABASE.md`](./AI/DATABASE.md) | Esquema, relaciones, control de aforo sin condiciones de carrera |
| [`SECURITY.md`](./AI/SECURITY.md) | Auth, RLS, RGPD/LOPDGDD y tratamiento de menores |
| [`CODE_STYLE.md`](./AI/CODE_STYLE.md) | Convenciones de código |
| [`API_STANDARDS.md`](./AI/API_STANDARDS.md) | Convenciones de Edge Functions / RPC |
| [`ENGINEERING_RULES.md`](./AI/ENGINEERING_RULES.md) | Ramas, commits, manejo de errores |
| [`AI_REVIEW_CHECKLIST.md`](./AI/AI_REVIEW_CHECKLIST.md) | Checklist antes de dar una tarea por terminada |
| [`TASK_WORKFLOW.md`](./AI/TASK_WORKFLOW.md) | Fases del proyecto y en qué orden se construye |
| [`DEPLOYMENT.md`](./AI/DEPLOYMENT.md) | Infraestructura, variables de entorno, go-live |
| [`TESTING.md`](./AI/TESTING.md) | Qué probar, cómo, en qué dispositivos |
| [`CONTRIBUTING.md`](./AI/CONTRIBUTING.md) | Cómo montar el entorno de desarrollo |
| [`DECISIONS.md`](./AI/DECISIONS.md) | Registro de decisiones técnicas (ADR) |

## Arranque rápido

Ver [`AI/CONTRIBUTING.md`](./AI/CONTRIBUTING.md) para el detalle completo. Resumen:

```bash
npm install
cp .env.example .env   # y rellenar con los valores de `supabase start`
supabase start
supabase db reset
npm run dev
```

## Estado actual

**Fase 0 (Cimientos) completada:** proyecto Vite + React + TypeScript estricto, Tailwind CSS, ESLint + Prettier, TanStack Query, cliente de Supabase, Vitest, y CI en GitHub Actions — todo verificado y funcionando. Ver [`AI/TASK_WORKFLOW.md`](./AI/TASK_WORKFLOW.md) para las fases siguientes.
