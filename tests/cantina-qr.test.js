import test from "node:test";
import assert from "node:assert/strict";

const LOCATION_NAMES = {
  "cancha-1": "Cancha 1 (Pista de Cristal)",
  "cancha-2": "Cancha 2 (Pista de Cristal)",
  "mesa-1": "Mesa 1 (Cantina)",
  "mesa-2": "Mesa 2 (Cantina)",
  "mesa-3": "Mesa 3 (Cantina)",
};

function formatOrderMessage({ location, itemName, price }) {
  const prefix = location ? `*PEDIDO PARA ${location.toUpperCase()}*\n\n` : "";
  return `${prefix}¡Hola Muzzaga! Quiero pedir ${itemName} ($${price.toLocaleString("es-AR")}) de la cantina.`;
}

test("formatOrderMessage includes delivery location when specified", () => {
  const msgWithCancha = formatOrderMessage({
    location: LOCATION_NAMES["cancha-1"],
    itemName: "Pizza muzza",
    price: 18000,
  });

  assert.match(msgWithCancha, /\*PEDIDO PARA CANCHA 1 \(PISTA DE CRISTAL\)\*/);
  assert.match(msgWithCancha, /Pizza muzza/);
  assert.match(msgWithCancha, /\$18\.000/);

  const msgWithMesa = formatOrderMessage({
    location: LOCATION_NAMES["mesa-2"],
    itemName: "Corona 710ml",
    price: 10000,
  });

  assert.match(msgWithMesa, /\*PEDIDO PARA MESA 2 \(CANTINA\)\*/);
  assert.match(msgWithMesa, /Corona 710ml/);
});

test("formatOrderMessage formats regular order without location", () => {
  const regularMsg = formatOrderMessage({
    location: null,
    itemName: "Agua 1.5L",
    price: 4000,
  });

  assert.doesNotMatch(regularMsg, /\*PEDIDO PARA/);
  assert.match(regularMsg, /Agua 1\.5L/);
});
