import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingTotal,
  computeDailyCash,
  dayOccupancy,
  paidAmount,
  pendingAmount,
  periodOccupancy,
  summarizeRecords,
  buildDailySummaries,
  trendPct,
} from "../lib/metrics.js";
import {
  formatARS,
  formatTime,
  formatDate,
  plural,
  formatPct,
} from "../lib/format.js";
import {
  isoAddDays,
  isoWeekday,
  nextDays,
  isClosedDay,
} from "../lib/booking.js";

// payments se guardan con push(): es un objeto, no un array.
const booking = (over = {}) => ({
  date: "2026-09-22",
  startTime: "20:00",
  status: "confirmado",
  total: 60000,
  ...over,
});

test("payments guardados como objeto (push) se suman sin romper", () => {
  const b = booking({
    payments: {
      a: { method: "efectivo", amount: 20000 },
      b: { method: "mercadopago", amount: 10000 },
    },
  });
  assert.equal(paidAmount(b), 30000);
  assert.equal(pendingAmount(b), 30000);
});

test("pago online de Mercado Pago (webhook) cuenta como cobrado", () => {
  const b = booking({ paymentStatus: "approved", paidAmount: 15000 });
  const cash = computeDailyCash({ bookings: [b] });
  assert.equal(cash.turnos.mercadopago, 15000);
  assert.equal(pendingAmount(b), 45000);
});

test("bloqueos, cancelados y pruebas no facturan ni se deben", () => {
  assert.equal(bookingTotal(booking({ status: "bloqueado" })), 0);
  assert.equal(bookingTotal(booking({ status: "cancelado" })), 0);
  assert.equal(bookingTotal(booking({ isTest: true })), 0);
  assert.equal(pendingAmount(booking({ status: "bloqueado" })), 0);
});

test("caja del día: turnos + cantina - egresos, mismo cálculo para Agenda y Caja", () => {
  const cash = computeDailyCash({
    bookings: [
      booking({ payments: { a: { method: "efectivo", amount: 30000 } } }),
      booking({ payments: { a: { amount: 5000 } } }), // sin método = efectivo
      booking({
        isTest: true,
        payments: { a: { method: "efectivo", amount: 99999 } },
      }),
    ],
    sales: [
      { method: "efectivo", total: 65000 },
      { method: "mercadopago", total: 18000 },
      { method: "efectivo", total: 1000, isTest: true },
    ],
    expenses: [{ amount: 4000 }],
  });
  assert.equal(cash.turnos.efectivo, 35000);
  assert.equal(cash.cantina.efectivo, 65000);
  assert.equal(cash.byMethod.mercadopago, 18000);
  assert.equal(cash.expectedCash, 35000 + 65000 - 4000);
  assert.equal(cash.cobrado, 35000 + 65000 + 18000);
});

test("resumen detecta turnos marcados pagados sin cobro cargado", () => {
  const s = summarizeRecords({
    bookings: [booking({ status: "pagado" }), booking({ status: "bloqueado" })],
  });
  assert.equal(s.turnos, 1);
  assert.equal(s.bloqueados, 1);
  assert.equal(s.pagadosSinCobro, 1);
  assert.equal(s.facturadoTurnos, 60000);
  assert.equal(s.porCobrar, 60000);
});

test("resúmenes diarios agrupan por fecha e ignoran fechas fuera del período", () => {
  const days = buildDailySummaries(
    ["2026-09-21", "2026-09-22"],
    [booking(), booking({ date: "2026-08-01" })],
    [{ date: "2026-09-21", method: "efectivo", total: 5000 }],
  );
  assert.equal(days[0].cantina, 5000);
  assert.equal(days[1].turnos, 1);
});

test("ocupación: 1 turno de 14 = 7,1%, con 1 decimal", () => {
  assert.equal(dayOccupancy({ turnos: 1, totalSlots: 14 }), 7.1);
  assert.equal(dayOccupancy({ turnos: 0, totalSlots: 0 }), null);
  // un bloqueo de mantenimiento resta del disponible
  assert.equal(dayOccupancy({ turnos: 1, totalSlots: 14, bloqueados: 4 }), 10);
});

test("ocupación del período cuenta solo días abiertos ya transcurridos", () => {
  const days = [
    { date: "2026-09-21", turnos: 0, totalSlots: 14 },
    { date: "2026-09-22", turnos: 1, totalSlots: 14 },
    { date: "2026-09-23", turnos: 0, totalSlots: 14 }, // futuro
    { date: "2026-09-27", turnos: 0, totalSlots: 0 }, // domingo
  ];
  assert.equal(periodOccupancy(days, "2026-09-22"), 3.6); // 1/28
  assert.equal(periodOccupancy(days, "2026-09-01"), null);
});

test("tendencia", () => {
  assert.equal(trendPct(112, 100), 12);
  assert.equal(trendPct(5, 0), null);
});

test("formatARS escribe el signo, nunca depende solo del color", () => {
  assert.equal(formatARS(65000), "$65.000");
  assert.equal(formatARS(-3500), "-$3.500");
  assert.equal(formatARS(1000, { signed: true }), "+$1.000");
  assert.equal(formatARS(0, { signed: true }), "$0");
});

test("formatTime es 24 hs en hora de Catriel sin 'hs' ni 'p. m.'", () => {
  // 01:54 UTC del 23/09 = 22:54 del 22/09 en Argentina
  assert.equal(formatTime(new Date("2026-09-23T01:54:00Z")), "22:54");
});

test("formatDate y plural", () => {
  assert.equal(formatDate("2026-09-22"), "22/09");
  assert.match(formatDate("2026-09-22", "long"), /martes.*22.*septiembre/);
  assert.equal(plural(1, "turno jugado", "turnos jugados"), "1 turno jugado");
  assert.equal(plural(3, "turno", "turnos"), "3 turnos");
  assert.equal(formatPct(7.1), "7,1%");
  assert.equal(formatPct(null), "—");
});

test("aritmética de fechas ISO no depende del huso", () => {
  assert.equal(isoAddDays("2026-09-22", -6), "2026-09-16");
  assert.equal(isoAddDays("2026-12-31", 1), "2027-01-01");
  assert.equal(isoWeekday("2026-09-22"), 2); // martes
  assert.equal(isClosedDay("2026-09-27"), true); // domingo
  const days = nextDays(2, "2026-09-22");
  assert.equal(days[0].dayName, "Hoy");
  assert.equal(days[1].dayName, "Mié");
});

test("estado del club sale de SCHEDULE, en hora de Catriel", async () => {
  const { getClubStatus } = await import("../data/horarios.js");
  const at = (utc, opts) => getClubStatus(new Date(utc), opts);
  // martes 22/09 22:54 ART -> abierto, cierra a las 00:30
  assert.equal(at("2026-09-23T01:54:00Z").state, "abierto");
  // martes 23:50 ART -> faltan 40 min
  const soon = at("2026-09-23T02:50:00Z");
  assert.equal(soon.state, "cierra-pronto");
  assert.equal(soon.closesInMin, 40);
  // miércoles 00:15 ART -> sigue el turno del martes
  assert.equal(at("2026-09-23T03:15:00Z").isOpen, true);
  // lunes 00:15 ART, después de un domingo cerrado -> cerrado
  assert.equal(at("2026-09-28T03:15:00Z").state, "cerrado");
  // martes 12:00 ART -> todavía no abrió
  assert.equal(at("2026-09-22T15:00:00Z").state, "cerrado");
  // día bloqueado desde configuración
  assert.equal(
    at("2026-09-23T01:54:00Z", { blockedDates: ["2026-09-22"] }).state,
    "bloqueado",
  );
});

test("normalizeSearch tolera tildes y mayúsculas", async () => {
  const { normalizeSearch } = await import("../lib/format.js");
  assert.equal(normalizeSearch("  Martín PÉREZ "), "martin perez");
  assert.ok(normalizeSearch("Muñoz").includes(normalizeSearch("MUNOZ")));
});

test("estado de cobro para la grilla", async () => {
  const { paymentState } = await import("../lib/metrics.js");
  const b = (over) => ({ status: "confirmado", total: 60000, ...over });
  assert.equal(paymentState(b({})), "pendiente");
  assert.equal(paymentState(b({ payments: { a: { amount: 15000 } } })), "senado");
  assert.equal(paymentState(b({ payments: { a: { amount: 60000 } } })), "pagado");
  assert.equal(paymentState(b({ status: "bloqueado" })), "bloqueado");
  assert.equal(paymentState(b({ isTest: true })), "prueba");
});
