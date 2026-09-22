// Generador de enlaces y archivos de calendario para reservas de pádel
import { CLUB_INFO } from "../data/club.js";

/**
 * Formatea fecha ISO "YYYY-MM-DD" y hora "HH:MM" a formato compacto UTC/Local "YYYYMMDDTHHmmSS"
 */
function toCompactDateTime(dateStr, timeStr) {
  const cleanDate = dateStr.replace(/-/g, "");
  const cleanTime = timeStr.replace(/:/g, "") + "00";
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Genera el enlace web directo para agregar a Google Calendar
 */
export function buildGoogleCalendarUrl({
  courtName = "Cancha de Cristal",
  date,
  startTime,
  endTime = "21:30",
  bookingCode = "",
}) {
  const title = `Pádel en Muzzaga · ${courtName}`;
  const startCompact = toCompactDateTime(date, startTime);
  const endCompact = toCompactDateTime(date, endTime);
  const datesParam = `${startCompact}/${endCompact}`;

  const details = [
    `Turno de Pádel en Muzzaga Pádel (${courtName}).`,
    bookingCode ? `Código de reserva: #${bookingCode}` : "",
    `Dirección: ${CLUB_INFO.address}`,
    `Teléfono: ${CLUB_INFO.phoneFormatted}`,
    `¡Llegá 10 minutos antes para calentar y entrar en calor!`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: datesParam,
    details,
    location: `${CLUB_INFO.name}, ${CLUB_INFO.address}`,
    ctz: "America/Argentina/Buenos_Aires",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera el contenido de un archivo iCalendar (.ics) compatible con Apple Calendar, Google Calendar y Outlook
 */
export function buildIcsContent({
  courtName = "Cancha de Cristal",
  date,
  startTime,
  endTime = "21:30",
  bookingCode = "",
  total = 60000,
}) {
  const startCompact = toCompactDateTime(date, startTime);
  const endCompact = toCompactDateTime(date, endTime);
  const nowCompact = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
  const uid = `muzzaga-${bookingCode || Date.now()}@muzzagapadel.com.ar`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Muzzaga Padel//Sistema de Turnos//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowCompact}`,
    `DTSTART;TZID=America/Argentina/Buenos_Aires:${startCompact}`,
    `DTEND;TZID=America/Argentina/Buenos_Aires:${endCompact}`,
    `SUMMARY:Pádel en Muzzaga · ${courtName}`,
    `DESCRIPTION:Turno en Muzzaga Pádel (${courtName}). Código: ${bookingCode || "N/A"}. Total: $${Number(total).toLocaleString("es-AR")}.`,
    `LOCATION:${CLUB_INFO.name}, ${CLUB_INFO.address}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:¡Tenés partido de pádel en 2 horas en Muzzaga!",
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Dispara la descarga del archivo .ics en el navegador del usuario
 */
export function downloadIcsCalendar(bookingData) {
  const content = buildIcsContent(bookingData);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `partido-muzzaga-${bookingData.date || "turno"}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
