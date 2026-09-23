import test from "node:test";
import assert from "node:assert/strict";
import {
  datesBetween,
  previousPeriod,
  occupancyHeatmap,
  paymentMix,
  topProducts,
  topClients,
} from "../lib/reports.js";
import { normalizeConfig } from "../lib/clubConfig.js";

const config = normalizeConfig({});

test("períodos: rango inclusivo y período anterior del mismo largo", () => {
  assert.equal(datesBetween("2026-09-01", "2026-09-30").length, 30);
  assert.deepEqual(previousPeriod("2026-09-01", "2026-09-30"), {
    from: "2026-08-02",
    to: "2026-08-31",
  });
  assert.deepEqual(previousPeriod("2026-09-21", "2026-09-27"), {
    from: "2026-09-14",
    to: "2026-09-20",
  });
});

test("heatmap día × hora: cupos por cancha y turnos reservados", () => {
  // lunes 21 a domingo 27 de septiembre
  const dates = datesBetween("2026-09-21", "2026-09-27");
  const bookings = [
    { date: "2026-09-22", startTime: "20:00", status: "confirmado" },
    { date: "2026-09-22", startTime: "20:00", status: "pagado" },
    { date: "2026-09-22", startTime: "14:00", status: "cancelado" },
  ];
  const h = occupancyHeatmap(config, dates, bookings);
  assert.deepEqual(h.weekdays, [1, 2, 3, 4, 5, 6]); // domingo cerrado
  assert.equal(h.starts.length, 7);
  assert.deepEqual(h.cells["2|20:00"], { booked: 2, available: 2 });
  assert.deepEqual(h.cells["2|14:00"], { booked: 0, available: 2 });
});

test("mix de pagos, top productos y top clientes", () => {
  const bookings = [
    {
      playerName: "Ana",
      playerPhone: "2995551111",
      status: "confirmado",
      total: 60000,
      payments: { a: { method: "efectivo", amount: 60000 } },
    },
    {
      playerName: "Ana",
      playerPhone: "2995551111",
      status: "confirmado",
      total: 60000,
    },
    {
      playerName: "Beto",
      playerPhone: "2995552222",
      status: "confirmado",
      total: 60000,
    },
  ];
  const sales = [
    {
      method: "mercadopago",
      total: 20000,
      items: [{ name: "Pizza", price: 20000, qty: 1 }],
    },
    {
      method: "efectivo",
      total: 8000,
      items: [{ name: "Agua", price: 2000, qty: 4 }],
    },
    {
      method: "efectivo",
      total: 99999,
      voided: true,
      items: [{ name: "Anulada", price: 99999, qty: 1 }],
    },
  ];
  const mix = paymentMix(bookings, sales);
  assert.equal(mix.find((m) => m.method === "efectivo").amount, 68000);
  assert.equal(mix.find((m) => m.method === "mercadopago").pct, 22.7);
  const products = topProducts(sales);
  assert.deepEqual(
    products.map((p) => p.name),
    ["Pizza", "Agua"],
  );
  assert.equal(products[1].qty, 4);
  const clients = topClients(bookings);
  assert.equal(clients[0].name, "Ana");
  assert.equal(clients[0].turnos, 2);
});
