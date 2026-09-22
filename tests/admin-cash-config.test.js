import test from "node:test";
import assert from "node:assert/strict";
import { PRECIO_TURNO, PRECIO_POR_JUGADOR, DURACION_MIN } from "../data/pricing.js";

// Helper de simulación de balance de caja (mismo algoritmo que en CajaView y actions.js)
function calculateCashBalance({ cashBookings, cashCantina, expenses, actualCashCount }) {
  const totalIncomeCash = cashBookings + cashCantina;
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const expectedCash = totalIncomeCash - totalExpenses;
  const diff = actualCashCount - expectedCash;

  return {
    totalIncomeCash,
    totalExpenses,
    expectedCash,
    diff,
    status: diff === 0 ? "cuadrado" : diff > 0 ? "sobrante" : "faltante",
  };
}

test("admin club config has robust default values matching pricing constants", () => {
  const defaultConfig = {
    precioTurno: PRECIO_TURNO,
    precioJugador: PRECIO_POR_JUGADOR,
    duracionMin: DURACION_MIN,
    alias: "MUZZAGA.PADEL",
    cbu: "0000003100010000000000",
    titular: "Muzzaga Pádel S.R.L.",
    whatsapp: "5492995960000",
    blockedDates: [],
  };

  assert.equal(defaultConfig.precioTurno, 60000);
  assert.equal(defaultConfig.precioJugador, 15000);
  assert.equal(defaultConfig.duracionMin, 90);
  assert.ok(defaultConfig.alias.length > 0);
  assert.ok(defaultConfig.cbu.length >= 20);
});

test("daily cash calculation balances correctly when cash in drawer matches expected", () => {
  const cashBookings = 45000; // 3 señas en efectivo de $15.000
  const cashCantina = 12000;  // Bebidas y snacks en efectivo
  const expenses = [
    { id: "e1", description: "Hielo para cantina", amount: 4000 },
    { id: "e2", description: "Cinta de agarre", amount: 3000 },
  ];
  const actualCashCount = 50000; // 45000 + 12000 - 7000 = 50000

  const res = calculateCashBalance({
    cashBookings,
    cashCantina,
    expenses,
    actualCashCount,
  });

  assert.equal(res.totalIncomeCash, 57000);
  assert.equal(res.totalExpenses, 7000);
  assert.equal(res.expectedCash, 50000);
  assert.equal(res.diff, 0);
  assert.equal(res.status, "cuadrado");
});

test("daily cash calculation detects faltante de caja correctly", () => {
  const cashBookings = 30000;
  const cashCantina = 5000;
  const expenses = [
    { id: "e1", description: "Limpieza", amount: 5000 },
  ];
  // Expected: 30000 + 5000 - 5000 = 30000
  // Actual: 28000 (falta $2000)
  const res = calculateCashBalance({
    cashBookings,
    cashCantina,
    expenses,
    actualCashCount: 28000,
  });

  assert.equal(res.expectedCash, 30000);
  assert.equal(res.diff, -2000);
  assert.equal(res.status, "faltante");
});

test("daily cash calculation detects sobrante de caja correctly", () => {
  const cashBookings = 15000;
  const cashCantina = 10000;
  const expenses = [];
  // Expected: 25000
  // Actual: 26000 (sobra $1000)
  const res = calculateCashBalance({
    cashBookings,
    cashCantina,
    expenses,
    actualCashCount: 26000,
  });

  assert.equal(res.expectedCash, 25000);
  assert.equal(res.diff, 1000);
  assert.equal(res.status, "sobrante");
});
