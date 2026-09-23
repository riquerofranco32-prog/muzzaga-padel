// Formateo único de moneda, fechas y horas del admin. Toda la UI pasa por
// acá: locale es-AR, huso de Catriel y reloj de 24 hs.

const CLUB_TIMEZONE = "America/Argentina/Buenos_Aires";

const integerFormat = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

const timeFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: CLUB_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Las fechas ISO ("YYYY-MM-DD") no tienen hora: se formatean en UTC para que
// no se corran un día según el huso de quien las mire.
const longDateFormat = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * "$65.000", "-$3.500", o con `signed` "+$1.000". El signo siempre va
 * escrito: nunca se depende solo del color para marcar un negativo.
 * @param {number} amount
 * @param {{ signed?: boolean }} [opts]
 */
export function formatARS(amount, { signed = false } = {}) {
  const n = Math.round(Number(amount) || 0);
  const sign = n < 0 ? "-" : signed && n > 0 ? "+" : "";
  return `${sign}$${integerFormat.format(Math.abs(n))}`;
}

/** "22:54" en hora de Catriel. @param {Date|number} date */
export function formatTime(date = new Date()) {
  return timeFormat.format(date);
}

/**
 * @param {string} isoDate "YYYY-MM-DD"
 * @param {"short"|"long"} [style] short = "22/09", long = "martes, 22 de septiembre"
 */
export function formatDate(isoDate, style = "short") {
  const [y, m, d] = isoDate.split("-");
  // ponytail: "short" armado a mano, ICU de es-AR ignora month "2-digit" (da "22/9")
  if (style === "short") return `${d}/${m}`;
  return longDateFormat.format(new Date(Date.UTC(+y, m - 1, +d)));
}

/** "1 turno", "3 turnos". */
export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

/** 7,1% — un decimal, coma decimal. `null` se muestra como "—". */
export function formatPct(pct) {
  if (pct == null) return "—";
  return `${pct.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
}
