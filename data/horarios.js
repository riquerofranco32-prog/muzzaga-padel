// Horarios del club y utilidades de estado en tiempo real (zona horaria Buenos Aires)

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

/**
 * Determina si el club está abierto en este momento
 */
export function getClubStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);

  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value;
  const day = dayMap[weekdayStr] ?? date.getDay();
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const currentMinutes = hour * 60 + minute;

  // Lunes a sábado: 14:00 (840) hasta 00:30 (30 del día siguiente)
  const isAfterMidnightBeforeClose = currentMinutes <= 30 && day !== 1; // 00:00 a 00:30 (excepto lunes a la madrugada)
  const isDaytimeOpen = day !== 0 && currentMinutes >= 14 * 60; // 14:00 a 23:59

  const isOpen = isAfterMidnightBeforeClose || isDaytimeOpen;
  return {
    isOpen,
    statusText: isOpen ? "Club Abierto" : "Club Cerrado",
    scheduleLabel: SCHEDULE[day]?.label || "14:00 a 00:30 hs",
    isNight: hour >= 19 || hour < 6, // Iluminación LED activa después de las 19:00 o madrugada
  };
}

export function isClubOpenNow(date = new Date()) {
  return getClubStatus(date).isOpen;
}
