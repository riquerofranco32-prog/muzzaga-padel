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
function openWindow(isoDate, blockedDates, schedule) {
  const day = schedule[isoWeekday(isoDate)];
  if (!day?.open || blockedDates.includes(isoDate)) return null;
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  return { start, end: end <= start ? end + DAY_MIN : end };
}

/**
 * Estado del club ahora, según el horario (el de Configuración, o SCHEDULE
 * por defecto) y los días bloqueados.
 * state: "abierto" | "cierra-pronto" | "cerrado" | "bloqueado"
 * @param {Date} [date]
 * @param {{ blockedDates?: string[], schedule?: Array<{ open: boolean, start: string, end: string }> }} [opts]
 */
export function getClubStatus(
  date = new Date(),
  { blockedDates = [], schedule = SCHEDULE } = {},
) {
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
  const today = openWindow(iso, blockedDates, schedule);
  const yesterdayIso = isoAddDays(iso, -1);
  const yesterday = openWindow(yesterdayIso, blockedDates, schedule);
  let closesInMin = null;
  let closesAt = null;
  if (today && minutes >= today.start && minutes < today.end) {
    closesInMin = today.end - minutes;
    closesAt = schedule[isoWeekday(iso)].end;
  } else if (yesterday && minutes + DAY_MIN < yesterday.end) {
    closesInMin = yesterday.end - (minutes + DAY_MIN);
    closesAt = schedule[isoWeekday(yesterdayIso)].end;
  }

  // Próxima apertura (si está cerrado): hoy más tarde o alguno de los
  // próximos 7 días. dayOffset 0 = hoy, 1 = mañana.
  let nextOpen = null;
  if (closesInMin == null) {
    for (let offset = 0; offset <= 7 && !nextOpen; offset++) {
      const day = isoAddDays(iso, offset);
      const w = openWindow(day, blockedDates, schedule);
      if (w && (offset > 0 || minutes < w.start)) {
        nextOpen = { dayOffset: offset, weekday: isoWeekday(day), start: schedule[isoWeekday(day)].start };
      }
    }
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
    closesAt,
    nextOpen,
    statusText: STATUS_TEXT[state],
    scheduleLabel: SCHEDULE[isoWeekday(iso)]?.label || "14:00 a 00:30 hs",
    isNight: hour >= 19 || hour < 6, // Iluminación LED activa después de las 19:00 o madrugada
  };
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/**
 * Estado en una línea, solo con lo que sale del horario:
 * "Abierto ahora · cierra a las 00:30", "Abierto · cierra en 40 min",
 * "Cerrado · abre hoy a las 14:00", "Cerrado · abre el lunes a las 14:00".
 * @param {ReturnType<typeof getClubStatus>} status
 */
export function clubStatusLine(status) {
  if (status.isOpen) {
    return status.state === "cierra-pronto"
      ? `Abierto · cierra en ${status.closesInMin} min`
      : `Abierto ahora · cierra a las ${status.closesAt}`;
  }
  const n = status.nextOpen;
  if (!n) return "Cerrado";
  const when = n.dayOffset === 0 ? "hoy" : n.dayOffset === 1 ? "mañana" : `el ${WEEKDAYS[n.weekday]}`;
  return `Cerrado · abre ${when} a las ${n.start}`;
}

export function isClubOpenNow(date = new Date()) {
  return getClubStatus(date).isOpen;
}
