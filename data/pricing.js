// Precios y parámetros oficiales de turnos en Muzzaga Pádel
export const PRECIO_TURNO = 60000;
export const DURACION_MIN = 90;
export const JUGADORES_POR_CANCHA = 4;
export const PRECIO_POR_JUGADOR = Math.round(PRECIO_TURNO / JUGADORES_POR_CANCHA); // 15.000

export function priceForSlot(isoDate, startTime) {
  return {
    total: PRECIO_TURNO,
    perPlayer: PRECIO_POR_JUGADOR,
    durationMin: DURACION_MIN,
  };
}
