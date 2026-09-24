// Equipo del club y PINs que identifican quién hizo cada cambio.
// Solo servidor: nunca importar desde un componente "use client", el material
// de los PINs no puede llegar al navegador. El equipo vive en Firebase
// (`staffMembers`) y se administra desde Configuración → Equipo.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const STAFF_PIN = /^\d{4,6}$/;
export const STAFF_ROLES = [
  "Administrador",
  "Encargado",
  "Recepción",
  "Cantina",
  "Profesor",
];

// ponytail: sha256 con sal alcanza para no guardar PINs en claro; un PIN de
// 4 dígitos igual se prueba rápido si alguien lee la base. El freno real es
// el rate limit del server (adminRateLimit, scope "pin").
export function hashPin(pin, salt) {
  return createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

/** Registro listo para guardar en Firebase: nunca incluye el PIN en claro. */
export function makeStaffRecord({ name, role, pin }) {
  const salt = randomBytes(8).toString("hex");
  return {
    name: String(name || "")
      .trim()
      .slice(0, 40),
    role: STAFF_ROLES.includes(role) ? role : "Recepción",
    salt,
    pinHash: hashPin(String(pin), salt),
  };
}

function pinMatches(member, pin) {
  if (!member?.pinHash || !member?.salt) return false;
  const a = Buffer.from(hashPin(pin, member.salt), "hex");
  const b = Buffer.from(String(member.pinHash), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Busca al integrante activo dueño del PIN.
 * @param {string} pin
 * @param {Array<{id:string,name:string,role:string,salt:string,pinHash:string,active?:boolean}>} members
 * @returns {{ valid: boolean, staff: { id: string, name: string, role: string } | null }}
 */
export function verifyStaffPin(pin, members = []) {
  const clean = String(pin || "").trim();
  if (!STAFF_PIN.test(clean) || !Array.isArray(members)) {
    return { valid: false, staff: null };
  }
  const member = members.find(
    (m) => m.active !== false && pinMatches(m, clean),
  );
  if (!member) return { valid: false, staff: null };
  return {
    valid: true,
    staff: { id: member.id, name: member.name, role: member.role },
  };
}

/**
 * true si otro integrante ya usa (o usó) ese PIN. Incluye a los dados de baja:
 * así reactivar a alguien nunca deja dos personas con el mismo PIN.
 */
export function isPinTaken(pin, members, exceptId = null) {
  return members.some((m) => m.id !== exceptId && pinMatches(m, String(pin)));
}

/** Datos del equipo aptos para mandar al navegador. */
export function publicStaff(members) {
  return members.map(({ id, name, role, active, createdAt }) => ({
    id,
    name,
    role,
    active: active !== false,
    createdAt: createdAt || null,
  }));
}
