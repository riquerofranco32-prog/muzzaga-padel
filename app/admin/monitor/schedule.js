// Cálculo de "en juego" / "próximo" del Monitor TV. Puro para poder testearlo.
import { isCountableBooking } from "../../../lib/metrics.js";

const DAY_MIN = 1440;

export function toMinutes(hhmm) {
  const [h, m] = String(hhmm || "0:0")
    .split(":")
    .map(Number);
  return h * 60 + m;
}

/**
 * Ventana del turno en minutos relativos a hoy 00:00. `dayOffset` es -1 para
 * los turnos de ayer. Un fin menor o igual al inicio cruza la medianoche.
 */
export function bookingWindow(booking, dayOffset = 0) {
  const start = toMinutes(booking.startTime);
  let end = toMinutes(booking.endTime);
  if (end <= start) end += DAY_MIN;
  const shift = dayOffset * DAY_MIN;
  return { start: start + shift, end: end + shift };
}

/**
 * Turnos reales de una cancha con su ventana, ordenados. Ayer solo aporta
 * los que siguen en juego pasada la medianoche.
 */
export function courtSchedule(
  courtId,
  todayBookings = [],
  yesterdayBookings = [],
) {
  const withWindow = (list, offset) =>
    list
      .filter((b) => b.courtId === courtId && isCountableBooking(b))
      .map((b) => ({ booking: b, ...bookingWindow(b, offset) }));
  return [
    ...withWindow(yesterdayBookings, -1).filter((x) => x.end > 0),
    ...withWindow(todayBookings, 0),
  ].sort((a, b) => a.start - b.start);
}

/** { live, next } para el minuto `now` (minutos desde hoy 00:00). */
export function liveAndNext(schedule, now) {
  const live = schedule.find((x) => now >= x.start && now < x.end) || null;
  const next = schedule.find((x) => x.start > now) || null;
  return { live, next };
}
