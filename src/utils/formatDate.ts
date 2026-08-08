// "T00:00:00" sin "Z" es a propósito: fuerza a JavaScript a interpretar
// la fecha en local, no en UTC — así se muestra el día que de verdad
// corresponde en España, sin desplazarse por el huso horario.
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
