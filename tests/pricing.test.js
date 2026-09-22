import test from "node:test";
import assert from "node:assert/strict";
import { PRECIO_TURNO, PRECIO_POR_JUGADOR, DURACION_MIN, priceForSlot } from "../data/pricing.js";
import { MENU_ITEMS, getMenuByCategory } from "../data/menu.js";

test("pricing data has expected constants", () => {
  assert.equal(PRECIO_TURNO, 60000);
  assert.equal(PRECIO_POR_JUGADOR, 15000);
  assert.equal(DURACION_MIN, 90);

  const slotPrice = priceForSlot();
  assert.equal(slotPrice.total, 60000);
  assert.equal(slotPrice.perPlayer, 15000);
});

test("menu catalog has valid prices and tags", () => {
  assert.ok(MENU_ITEMS.length >= 20);

  // Check specific items audited for inconsistencies
  const heineken = MENU_ITEMS.find((i) => i.id === "heineken_litro");
  assert.ok(heineken);
  assert.equal(heineken.price, 10000);

  const corona = MENU_ITEMS.find((i) => i.id === "corona_710");
  assert.ok(corona);
  assert.equal(corona.price, 10000);

  const mila = MENU_ITEMS.find((i) => i.id === "sandwich_mila");
  assert.ok(mila);
  assert.equal(mila.price, 20000);

  const empanada = MENU_ITEMS.find((i) => i.id === "empanada_unidad");
  assert.ok(empanada);
  assert.equal(empanada.price, 2000);

  // Verify all items have positive integer prices
  for (const item of MENU_ITEMS) {
    assert.ok(typeof item.price === "number" && item.price > 0, `Invalid price for ${item.id}`);
    assert.ok(item.name && item.name.length > 0, `Missing name for ${item.id}`);
    assert.ok(item.category, `Missing category for ${item.id}`);
  }

  // Verify featured items exist
  const featured = MENU_ITEMS.filter((i) => i.featured);
  assert.ok(featured.length >= 4);
});
