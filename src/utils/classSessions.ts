/**
 * Calcula cuántas plazas quedan libres en una sesión.
 * Nunca devuelve un número negativo aunque, por algún fallo previo,
 * hubiera más reservas confirmadas que aforo — mejor mostrar 0 que un
 * "-2 plazas libres" sin sentido para el usuario.
 */
export function getRemainingSpots(aforoMaximo: number, ocupadas: number): number {
  return Math.max(0, aforoMaximo - ocupadas);
}

export function isSessionFull(aforoMaximo: number, ocupadas: number): boolean {
  return getRemainingSpots(aforoMaximo, ocupadas) === 0;
}
