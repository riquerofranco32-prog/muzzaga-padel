// Agregados para Reportes. Puros (testeados en tests/reports.test.js) y
// apoyados en metrics.js: ningún número de plata se calcula distinto que en
// Agenda o Caja.

import { isoAddDays, isoWeekday } from "./booking.js";
import { slotTimesFor } from "./clubConfig.js";
import { clientKey } from "./clientsExport.js";
import {
  bookingTotal,
  computeDailyCash,
  isCountableBooking,
  isTestRecord,
  isVoidedSale,
} from "./metrics.js";

/** Fechas ISO de `from` a `to` inclusive. */
export function datesBetween(from, to) {
  const dates = [];
  for (let d = from; d <= to; d = isoAddDays(d, 1)) dates.push(d);
  return dates;
}

/** El período inmediatamente anterior, del mismo largo. */
export function previousPeriod(from, to) {
  const length = datesBetween(from, to).length;
  const prevTo = isoAddDays(from, -1);
  return { from: isoAddDays(prevTo, -(length - 1)), to: prevTo };
}

/**
 * Ocupación por día de la semana × horario de inicio.
 * @returns {{ weekdays: number[], starts: string[], cells: Record<string, { booked: number, available: number }> }}
 *   cells["2|20:00"] = martes 20:00
 */
export function occupancyHeatmap(config, dates, bookings) {
  const cells = {};
  const starts = [];
  const key = (wd, start) => `${wd}|${start}`;
  const cell = (k) => (cells[k] ||= { booked: 0, available: 0 });

  for (const date of dates) {
    const wd = isoWeekday(date);
    for (const { start } of slotTimesFor(config, date)) {
      if (!starts.includes(start)) starts.push(start);
      cell(key(wd, start)).available += config.courts.length;
    }
  }
  const inPeriod = new Set(dates);
  bookings
    .filter((b) => isCountableBooking(b) && inPeriod.has(b.date))
    .forEach((b) => {
      const k = key(isoWeekday(b.date), b.startTime);
      if (cells[k]) cells[k].booked += 1;
    });

  // Lunes primero; los días que no abren en todo el período no aparecen.
  const weekdays = [1, 2, 3, 4, 5, 6, 0].filter((wd) =>
    starts.some((s) => cells[key(wd, s)]?.available > 0),
  );
  return { weekdays, starts, cells };
}

/** Plata cobrada por método (turnos + cantina) y su % del total. */
export function paymentMix(bookings, sales) {
  const { byMethod } = computeDailyCash({ bookings, sales });
  const total = Object.values(byMethod).reduce((a, b) => a + b, 0);
  return Object.entries(byMethod).map(([method, amount]) => ({
    method,
    amount,
    pct: total ? Math.round((amount / total) * 1000) / 10 : 0,
  }));
}

/** Productos de cantina más vendidos (por plata), sin anuladas ni pruebas. */
export function topProducts(sales, limit = 8) {
  const byName = new Map();
  sales
    .filter((s) => !isVoidedSale(s) && !isTestRecord(s))
    .forEach((s) =>
      (s.items || []).forEach((it) => {
        const row = byName.get(it.name) || {
          name: it.name,
          qty: 0,
          revenue: 0,
        };
        const qty = Number(it.qty) || 1;
        row.qty += qty;
        row.revenue += qty * (Number(it.price) || 0);
        byName.set(it.name, row);
      }),
    );
  return [...byName.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Clientes con más turnos en el período (desempate: más facturado). */
export function topClients(bookings, limit = 8) {
  const byKey = new Map();
  bookings.filter(isCountableBooking).forEach((b) => {
    const key = clientKey(b.playerPhone, b.playerName);
    const row = byKey.get(key) || {
      key,
      name: (b.playerName || "Sin nombre").trim(),
      turnos: 0,
      facturado: 0,
    };
    row.turnos += 1;
    row.facturado += bookingTotal(b);
    byKey.set(key, row);
  });
  return [...byKey.values()]
    .sort((a, b) => b.turnos - a.turnos || b.facturado - a.facturado)
    .slice(0, limit);
}
