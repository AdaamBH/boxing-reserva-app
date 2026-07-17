# ENGINEERING_RULES.md

Cómo trabajamos, no qué escribimos (eso es `CODE_STYLE.md`).

## Flujo de ramas

Trabajas en solitario, pero seguimos una disciplina real de ramas — es lo que se espera en cualquier entorno profesional, y es gratis empezar bien ahora en vez de tener que aprenderlo bajo presión más adelante en un trabajo real:

- **`main`** siempre es una versión funcional y desplegable. Nunca se hace commit directo sobre `main`.
- Cada funcionalidad o tarea vive en su propia rama: `feature/reserva-clase`, `fix/lista-espera-orden`, `chore/config-eslint`.
- Al terminar, se abre un Pull Request hacia `main`, incluso trabajando solo — te obliga a revisar tu propio diff con perspectiva antes de fusionar, y Vercel genera automáticamente una URL de preview del PR para probarlo antes de fusionar (ver `DEPLOYMENT.md`).
- Se fusiona con **squash merge** (todos los commits de la rama se combinan en uno limpio sobre `main`) para mantener el historial de `main` legible.

## Conventional Commits

Cada commit sigue el formato `tipo: descripción breve en presente`:

| Tipo | Cuándo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un error |
| `docs:` | Cambios solo en documentación (incluida esta carpeta `AI/`) |
| `refactor:` | Cambio de código que no altera comportamiento |
| `test:` | Añadir o corregir tests |
| `chore:` | Configuración, dependencias, tareas de mantenimiento |

Ejemplo: `feat: añadir promoción automática de lista de espera al cancelar reserva`

## Manejo de errores

- **Nunca un `catch` vacío.** Si un error se captura y se ignora sin más, es un bug esperando a pasar desapercibido.
- Errores esperables de negocio (clase llena, cancelación fuera de plazo) se modelan como resultados válidos con su propio `code` (ver `API_STANDARDS.md`), no como excepciones — son parte normal del flujo, no algo "excepcional".
- Errores inesperados (fallo de red, error de base de datos) sí se capturan como excepciones, se registran, y se muestran al usuario con un mensaje entendible ("Algo ha fallado, inténtalo de nuevo"), nunca con el error técnico en crudo.
- En React: un Error Boundary de nivel superior captura fallos de renderizado inesperados para que la aplicación entera no se quede en blanco por un error en un componente aislado.

## Definition of Done (cuándo una tarea está realmente terminada)

Una funcionalidad no se da por cerrada hasta que:
1. Cumple `CODE_STYLE.md`.
2. Tiene al menos los tests relevantes según `TESTING.md` (mínimo: el camino feliz y el caso límite más importante — por ejemplo, en reservas, el caso de aforo lleno).
3. Se ha pasado `AI_REVIEW_CHECKLIST.md` completo.
4. Funciona correctamente en un viewport móvil real o emulado.
5. Cualquier decisión técnica tomada durante la tarea que no estuviera prevista en `AI/` queda anotada en `DECISIONS.md`.

## Cuándo parar y avisar de deuda técnica

Si al implementar algo aparece una tentación de "por ahora lo hago rápido y ya lo arreglo después" — se para y se dice explícitamente en el momento, no se seas silenciosamente. Una nota rápida en `DECISIONS.md` o directamente sobre la marcha en la conversación es suficiente; lo que no vale es dejar que la deuda técnica se acumule sin que quede constancia de que existe.
