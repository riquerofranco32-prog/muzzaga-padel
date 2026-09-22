/**
 * Lógica pura para formatear mensajes y desgloses de la calculadora de gastos de Muzzaga Pádel.
 */

export function buildSplitCostMessage({
  canchaPrice = 0,
  players = 4,
  selectedExtras = {},
  menuItems = [],
  alias = "",
}) {
  const count = Number(players) || 1;
  let extrasTotal = 0;
  const extraLines = [];

  Object.entries(selectedExtras).forEach(([id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    if (item && qty > 0) {
      const lineTotal = item.price * qty;
      extrasTotal += lineTotal;
      extraLines.push(`  - ${qty}x ${item.name}: $${lineTotal.toLocaleString("es-AR")}`);
    }
  });

  const grandTotal = canchaPrice + extrasTotal;
  const perPerson = Math.round(grandTotal / count);

  let msg = `*DESGLOSE PARTIDO — MUZZAGA PÁDEL*\n\n`;
  msg += `• Cancha (90 min): $${canchaPrice.toLocaleString("es-AR")}\n`;

  if (extraLines.length > 0) {
    msg += `• Cantina & 3er Tiempo:\n${extraLines.join("\n")}\n`;
  }

  msg += `\nTotal General: $${grandTotal.toLocaleString("es-AR")}\n`;
  msg += `Total por jugador (${count} personas): *$${perPerson.toLocaleString("es-AR")}*\n\n`;

  if (alias && alias.trim()) {
    msg += `💳 *Alias / CBU para transferir:*\n👉 *${alias.trim()}*\n\n`;
  }

  msg += `🎾 Coordinación y reserva en Muzzaga Pádel (299 597-4176)`;
  return msg;
}

export function buildSplitCostWhatsAppUrl(params) {
  return `https://wa.me/?text=${encodeURIComponent(buildSplitCostMessage(params))}`;
}
