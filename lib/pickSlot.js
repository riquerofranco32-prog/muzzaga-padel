// Evento para pedirle al calendario de reservas que abra un turno puntual
// (lo dispara el widget de turnos libres de hoy).
export const PICK_SLOT_EVENT = "muzzaga:pick-slot";

/** @param {{ date: string, courtId: string, start: string }} slot */
export function requestSlotPick(slot) {
  window.dispatchEvent(new CustomEvent(PICK_SLOT_EVENT, { detail: slot }));
}
