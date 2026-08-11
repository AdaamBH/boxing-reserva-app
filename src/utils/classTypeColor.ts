/**
 * Colores apagados (ver --color-tag-* en styles/index.css) asignados de
 * forma determinista al nombre de la clase (session.nombre), no aleatoria:
 * la misma clase ("Boxeo técnico") debe verse siempre del mismo color,
 * sin importar el orden en que aparezca en la lista ni recargas de página.
 */
const CLASS_TYPE_PALETTE = [
  'bg-tag-cream',
  'bg-tag-blue',
  'bg-tag-yellow',
  'bg-tag-green',
  'bg-tag-lavender',
  'bg-tag-rose',
] as const;

export function getClassTypeColorClass(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash * 31 + nombre.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CLASS_TYPE_PALETTE.length;
  return CLASS_TYPE_PALETTE[index] as string;
}
