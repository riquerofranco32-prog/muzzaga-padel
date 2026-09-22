import test from "node:test";
import assert from "node:assert/strict";
import { calculateDeposit, buildPreferencePayload } from "../lib/mercadopago.js";

test("calculateDeposit computes 50% deposit correctly", () => {
  assert.equal(calculateDeposit(60000), 30000);
  assert.equal(calculateDeposit(50000), 25000);
  assert.equal(calculateDeposit(65000), 32500);
  // Default fallback if falsy
  assert.equal(calculateDeposit(null), 30000);
});

test("buildPreferencePayload creates valid Mercado Pago structure", () => {
  const payload = buildPreferencePayload({
    bookingCode: "MZG-TEST1",
    courtName: "Cancha 1 (Cristal)",
    date: "2026-09-25",
    startTime: "18:30",
    endTime: "20:00",
    amount: 30000,
    payerName: "Franco Riquero",
    payerEmail: "franco@example.com",
    siteUrl: "https://muzzagapadel.com.ar",
  });

  assert.equal(payload.external_reference, "MZG-TEST1");
  assert.equal(payload.auto_return, "approved");
  assert.ok(payload.items && payload.items.length === 1);
  assert.equal(payload.items[0].unit_price, 30000);
  assert.equal(payload.items[0].currency_id, "ARS");
  assert.match(payload.items[0].title, /Cancha 1/);

  assert.equal(
    payload.back_urls.success,
    "https://muzzagapadel.com.ar/?reserva=MZG-TEST1&status=approved"
  );
  assert.equal(
    payload.back_urls.failure,
    "https://muzzagapadel.com.ar/?reserva=MZG-TEST1&status=failure"
  );
  assert.equal(
    payload.notification_url,
    "https://muzzagapadel.com.ar/api/mercadopago/webhook"
  );
});
