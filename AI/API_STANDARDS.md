# API_STANDARDS.md

Con Supabase, "la API" tiene dos partes distintas — es importante no confundirlas:

1. **API autogenerada (PostgREST)**: cada tabla con RLS bien configurada se puede leer/escribir directamente desde el cliente a través del SDK de Supabase (`supabase.from('class_sessions').select(...)`). No escribes tú este endpoint — lo genera Supabase a partir del esquema.
2. **Edge Functions**: código de servidor que tú escribes para lógica que no es un simple CRUD (reservar con control de aforo, cancelar con promoción de lista de espera, enviar un email). Aquí sí aplican convenciones propias.

## Cuándo usar cada una

| Necesitas... | Usa |
|---|---|
| Leer una lista de clases, el perfil propio, tus reservas | API autogenerada (`supabase.from(...)`) protegida por RLS |
| Reservar o cancelar una plaza | Edge Function / función RPC (`supabase.rpc(...)`) — nunca un INSERT directo, por la razón de concurrencia explicada en `DATABASE.md` |
| Enviar un email | Edge Function (nunca desde el cliente — la clave de Resend no puede vivir en el frontend) |
| Cualquier lógica con reglas de negocio no triviales | Edge Function |

## Convención de nombres de funciones (RPC / Edge Functions)

Verbo en infinitivo + entidad, en inglés, `snake_case`: `book_class_session`, `cancel_booking`, `promote_from_waitlist`, `send_cancellation_email`. El nombre debe describir la acción de negocio, no la implementación (`book_class_session`, no `insert_booking_row`).

## Formato de respuesta estándar (Edge Functions)

Toda Edge Function devuelve una forma consistente, para que el frontend maneje errores de manera uniforme sin código especial por endpoint:

```ts
// Éxito
{ success: true, data: T }

// Error
{ success: false, error: { code: string; message: string } }
```

`code` es un identificador estable para el frontend (`"SESSION_FULL"`, `"CANCELLATION_TOO_LATE"`), no un texto libre — el texto legible (`message`) puede cambiar de redacción sin romper la lógica del cliente que solo debería inspeccionar `code`.

## Códigos HTTP (Edge Functions)

| Código | Cuándo |
|---|---|
| `200` | Operación completada (incluso si el "resultado de negocio" es, por ejemplo, `en_espera` — eso no es un error, es un resultado válido) |
| `400` | Datos de entrada inválidos (falla la validación de Zod) |
| `401` | No autenticado |
| `403` | Autenticado pero sin permiso (ejemplo: un alumno intentando cancelar la reserva de otro) |
| `404` | El recurso (sesión, reserva) no existe |
| `409` | Conflicto de negocio esperado (ejemplo: intentar cancelar una reserva ya cancelada) |
| `500` | Error inesperado del servidor — se registra siempre, nunca se ignora en silencio |

## Validación de entrada

Toda Edge Function valida su entrada con el mismo esquema de Zod que usa el formulario correspondiente en el frontend (ver `CODE_STYLE.md`, principio DRY). Si la validación falla, se responde `400` con el primer error de forma legible — nunca se deja que un dato inválido llegue a tocar la base de datos.

## Autenticación en cada llamada

Cada llamada, tanto a la API autogenerada como a una Edge Function, viaja con el JWT de sesión que gestiona el SDK de Supabase automáticamente. Ninguna Edge Function confía en un `user_id` que venga en el cuerpo de la petición — siempre lo extrae del JWT verificado (`auth.uid()` en el contexto de la función), igual que hace RLS. Esto es lo que impide que alguien reserve o cancele en nombre de otra persona simplemente cambiando un campo en la petición.

## Versionado

No se introduce versionado de API (`/v1/`, `/v2/`) en el MVP — con un único cliente (esta app) que controla tú mismo, no hay consumidores externos que romper. Se reconsidera si en el futuro terceros consumen esta API directamente (documentar la decisión en `DECISIONS.md` si ocurre).
