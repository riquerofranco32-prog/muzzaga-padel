// Equipo de trabajo y PINs de autorización para Muzzaga Pádel
// Permite identificar qué integrante del equipo realizó cada cambio, cobro, anulación o eliminación.

export const DEFAULT_STAFF = [
  { id: "franco", name: "Franco", role: "Administrador / Dueño", pin: "1234" },
  { id: "recepcion_m", name: "Recepción Mañana", role: "Recepción", pin: "1111" },
  { id: "recepcion_t", name: "Recepción Tarde", role: "Recepción", pin: "2222" },
  { id: "cantina", name: "Cantina / Turno Noche", role: "Buffet & Bar", pin: "3333" },
  { id: "encargado", name: "Encargado General", role: "Supervisor", pin: "9999" },
];

/**
 * Valida un PIN de 4 dígitos contra el equipo del club.
 * @param {string} pin - PIN ingresado
 * @param {Array} [customStaff] - Lista opcional de personal configurada en el club
 * @returns {{ valid: boolean, staff: { id: string, name: string, role: string } | null }}
 */
export function verifyStaffPin(pin, customStaff = null) {
  const staffList =
    Array.isArray(customStaff) && customStaff.length > 0
      ? customStaff
      : DEFAULT_STAFF;

  const cleanPin = String(pin || "").trim();
  if (!cleanPin) {
    return { valid: false, staff: null };
  }

  const member = staffList.find((s) => String(s.pin).trim() === cleanPin);
  if (!member) {
    return { valid: false, staff: null };
  }

  return {
    valid: true,
    staff: {
      id: member.id,
      name: member.name,
      role: member.role,
    },
  };
}

/**
 * Retorna la lista de miembros de personal para selector público o ayudas de staff.
 */
export function getStaffList(customStaff = null) {
  const staffList =
    Array.isArray(customStaff) && customStaff.length > 0
      ? customStaff
      : DEFAULT_STAFF;

  return staffList.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    pinHint: s.pin ? `${s.pin.slice(0, 1)}**${s.pin.slice(-1)}` : "••••",
  }));
}
