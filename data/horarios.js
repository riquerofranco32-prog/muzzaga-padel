// Horarios del club y utilidades de estado en tiempo real (zona horaria Buenos Aires)

import { isoAddDays, isoWeekday } from "../lib/booking.js";

export const TIMEZONE = "America/Argentina/Buenos_Aires";

// Horarios de apertura por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
export const SCHEDULE = {
  0: { open: false, label: "Cerrado" }, // Domingo
  1: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Lunes
  2: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Martes
  3: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Miércoles
  4: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Jueves
  5: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Viernes
  6: { open: true, start: "14:00", end: "00:30", label: "14:00 a 00:30 hs" }, // Sábado
};

/**
 * Devuelve la hora formateada en 24 hs (ej: "17:22 hs") en la zona horaria del club
 */
export function getClubTimeString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hour}:${minute} hs`;
}

export const formatClubTime = getClubTimeString;

const CLOSING_SOON_MIN = 60;
const DAY_MIN = 24 * 60;

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Ventana abierta de un día en minutos desde su 00:00. Un cierre "00:30" es
 * del día siguiente: queda como 1470. null si ese día no abre.
 */
function openWindow(isoDate, blockedDates) {
  const day = SCHEDULE[isoWeekday(isoDate)];
  if (!day?.open || blockedDates.includes(isoDate)) return null;
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  return { start, end: end <= start ? end + DAY_MIN : end };
}

/**
 * Estado del club ahora, según SCHEDULE y los días bloqueados de la
 * configuración.
 * state: "abierto" | "cierra-pronto" | "cerrado" | "bloqueado"
 * @param {Date} [date]
 * @param {{ blockedDates?: string[] }} [opts]
 */
export function getClubStatus(date = new Date(), { blockedDates = [] } = {}) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const iso = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number(get("hour"));
  const minutes = hour * 60 + Number(get("minute"));

  // Después de medianoche sigue abierto si el turno de ayer todavía no cerró.
  const today = openWindow(iso, blockedDates);
  const yesterday = openWindow(isoAddDays(iso, -1), blockedDates);
  let closesInMin = null;
  if (today && minutes >= today.start && minutes < today.end) {
    closesInMin = today.end - minutes;
  } else if (yesterday && minutes + DAY_MIN < yesterday.end) {
    closesInMin = yesterday.end - (minutes + DAY_MIN);
  }

  const isOpen = closesInMin != null;
  let state = "cerrado";
  if (isOpen)
    state = closesInMin <= CLOSING_SOON_MIN ? "cierra-pronto" : "abierto";
  else if (blockedDates.includes(iso)) state = "bloqueado";

  const STATUS_TEXT = {
    abierto: "Club Abierto",
    "cierra-pronto": `Cierra en ${closesInMin} min`,
    cerrado: "Club Cerrado",
    bloqueado: "Cerrado hoy (día bloqueado)",
  };

  return {
    isOpen,
    state,
    closesInMin,
    statusText: STATUS_TEXT[state],
    scheduleLabel: SCHEDULE[isoWeekday(iso)]?.label || "14:00 a 00:30 hs",
    isNight: hour >= 19 || hour < 6, // Iluminación LED activa después de las 19:00 o madrugada
  };
}

export function isClubOpenNow(date = new Date()) {
  return getClubStatus(date).isOpen;
}
