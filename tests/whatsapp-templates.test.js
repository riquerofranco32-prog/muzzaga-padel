import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReminderMessage,
  buildDepositRequestMessage,
  buildConfirmationMessage,
} from "../lib/adminMessages.js";

const mockBooking = {
  playerName: "Franco Riquero",
  playerPhone: "2995974176",
  courtName: "Cancha 1 (Cristal)",
  date: "2026-10-10",
  startTime: "20:00",
  endTime: "21:30",
  total: 60000,
  bookingCode: "MZ-9921",
  payments: {
    p1: { amount: 15000, method: "transferencia" },
  },
};

test("buildReminderMessage includes correct date, player name and pending balance", () => {
  const msg = buildReminderMessage(mockBooking);
  assert.ok(msg.includes("Franco Riquero"));
  assert.ok(msg.includes("2026-10-10"));
  assert.ok(msg.includes("20:00 hs"));
  assert.ok(msg.includes("Cancha 1 (Cristal)"));
  assert.ok(msg.includes("Saldo a abonar en recepción:"));
  assert.ok(msg.includes("45.000"));
});

test("buildDepositRequestMessage includes bank alias and player name", () => {
  const msg = buildDepositRequestMessage(mockBooking, "MUZZAGA.CATRIEL");
  assert.ok(msg.includes("Franco Riquero"));
  assert.ok(msg.includes("MUZZAGA.CATRIEL"));
  assert.ok(msg.includes("15.000"));
});

test("buildConfirmationMessage includes confirmation code and date", () => {
  const msg = buildConfirmationMessage(mockBooking);
  assert.ok(msg.includes("CONFIRMADO"));
  assert.ok(msg.includes("MZ-9921"));
  assert.ok(msg.includes("2026-10-10"));
});
