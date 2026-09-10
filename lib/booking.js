// Reglas de negocio del turnero. Compartido por el route handler de
// disponibilidad y por el server action de reserva para que nunca se
// desincronicen los horarios que se muestran de los que se pueden reservar.

export const COURTS = [
  { id: "cancha-1", name: "Cancha 1", type: "Cristal" },
  { id: "cancha-2", name: "Cancha 2", type: "Estándar" },
];

export const PRICE_PER_PLAYER = 15000;
export const PRICE_FULL = 60000;
export const SLOT_DURATION_MIN = 90;

// Lunes a Sábado, 14:00 a ~00:30. Domingo el club está cerrado.
const DAILY_START_TIMES = [
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:30",
  "23:00",
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/** @param {string} time "HH:MM" @param {number} minutes @returns {string} "HH:MM" */
function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/** @param {Date} date @returns {string} "YYYY-MM-DD" in local time */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isClosedDay(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0; // domingo
}

/** @returns {{start: string, end: string}[]} horarios del día, vacío si el club está cerrado */
export function getSlotTimesForDate(isoDate) {
  if (isClosedDay(isoDate)) return [];
  return DAILY_START_TIMES.map((start) => ({
    start,
    end: addMinutes(start, SLOT_DURATION_MIN),
  }));
}

/** Próximos `count` días (incluye hoy) para el selector de fechas. */
export function nextDays(count = 7, from = new Date()) {
  const days = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const iso = toISODate(d);
    days.push({
      iso,
      dayName: i === 0 ? "Hoy" : DAY_NAMES[d.getDay()],
      dayNumber: d.getDate(),
      monthName: MONTH_NAMES[d.getMonth()],
      fullLabel: `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`,
      closed: isClosedDay(iso),
    });
  }
  return days;
}

/** Clave determinística usada como lock de unicidad en Realtime Database. */
export function slotKey(courtId, startTime) {
  return `${courtId}_${startTime.replace(":", "")}`;
}

export function findCourt(courtId) {
  return COURTS.find((c) => c.id === courtId) || null;
}

export function isValidSlot(isoDate, courtId, startTime) {
  if (!findCourt(courtId)) return false;
  return getSlotTimesForDate(isoDate).some((slot) => slot.start === startTime);
}
