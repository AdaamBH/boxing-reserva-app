/**
 * El cliente de Supabase usa `fetch` sin timeout propio — si la conexión se
 * queda colgada (red móvil inestable, un intermediario que no cierra la
 * conexión), la promesa nunca se resuelve ni se rechaza y cualquier estado
 * de carga que dependa de ella se queda así para siempre, sin error visible
 * ni forma de reintentar salvo recargar la página a ciegas. Esto envuelve
 * cualquier promesa con un límite de tiempo explícito para que ese caso
 * termine siempre en un error legible, nunca en una carga infinita.
 */
// PromiseLike, no Promise: el query builder de Supabase (PostgrestBuilder)
// es "then-able" (funciona con await) pero no implementa el interfaz
// completo de Promise (catch/finally), así que un `Promise<T>` lo rechazaría
// en tiempo de compilación aunque funcione perfectamente en tiempo de
// ejecución.
export function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
