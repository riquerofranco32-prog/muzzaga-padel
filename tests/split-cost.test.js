import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSplitCostMessage,
  buildSplitCostWhatsAppUrl,
} from "../lib/splitCost.js";

test("buildSplitCostMessage formats court and extras correctly", () => {
  const menuItems = [
    { id: "heineken_litro", name: "Heineken 1L", price: 4200 },
    { id: "pizza_muzza", name: "Pizza Muzzarella", price: 9500 },
  ];

  const msg = buildSplitCostMessage({
    canchaPrice: 32000,
    players: 4,
    selectedExtras: {
      heineken_litro: 2,
      pizza_muzza: 1,
    },
    menuItems,
    alias: "lucas.padel.mp",
  });

  assert.ok(msg.includes("DESGLOSE PARTIDO — MUZZAGA PÁDEL"));
  assert.ok(msg.includes("Cancha (90 min): $32.000"));
  assert.ok(msg.includes("2x Heineken 1L: $8.400"));
  assert.ok(msg.includes("1x Pizza Muzzarella: $9.500"));
  // Total: 32000 + 8400 + 9500 = 49900. 49900 / 4 = 12475
  assert.ok(msg.includes("Total General: $49.900"));
  assert.ok(msg.includes("$12.475"));
  assert.ok(msg.includes("lucas.padel.mp"));
});

test("buildSplitCostWhatsAppUrl creates valid WhatsApp URL", () => {
  const url = buildSplitCostWhatsAppUrl({
    canchaPrice: 32000,
    players: 4,
    selectedExtras: {},
    menuItems: [],
    alias: "carlos.padel",
  });

  assert.ok(url.startsWith("https://wa.me/?text="));
  assert.ok(url.includes("carlos.padel"));
});
