// Duplicado deliberado de src/utils/formatDate.ts: las Edge Functions
// corren en un runtime Deno aparte, sin acceso directo al árbol de
// src/ del frontend (Vite) sin montar un import map compartido — no
// vale la pena esa infraestructura para dos funciones puras de 5 líneas.
export function formatSpanishDate(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatTime(hora: string): string {
  return hora.slice(0, 5);
}
