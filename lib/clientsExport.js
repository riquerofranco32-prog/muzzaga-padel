/**
 * Lógica pura de categorización, métricas y exportación CSV de clientes de Muzzaga Pádel.
 * Sin dependencias del DOM para poder ser testeado con node:test.
 */

export function categorizeClient(count = 0) {
  const c = Number(count) || 0;
  if (c >= 4) {
    return {
      category: "VIP",
      badge: "⭐ VIP",
      label: "Jugador Habitual",
      level: 3,
    };
  }
  if (c >= 2) {
    return {
      category: "Frecuente",
      badge: "🎾 Frecuente",
      label: "2-3 turnos",
      level: 2,
    };
  }
  return {
    category: "Nuevo",
    badge: "🌱 Nuevo",
    label: "1er turno",
    level: 1,
  };
}

export function getClientsMetrics(clients = []) {
  const totalClients = clients.length;
  let vipCount = 0;
  let frequentCount = 0;
  let newCount = 0;
  let totalBookings = 0;

  for (const client of clients) {
    const count = Number(client.count) || 0;
    totalBookings += count;
    if (count >= 4) {
      vipCount += 1;
    } else if (count >= 2) {
      frequentCount += 1;
    } else {
      newCount += 1;
    }
  }

  return {
    totalClients,
    vipCount,
    frequentCount,
    newCount,
    totalBookings,
    averagePerClient:
      totalClients > 0 ? (totalBookings / totalClients).toFixed(1) : "0",
  };
}

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(";") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateClientsCsv(clients = []) {
  const headers = [
    "Nombre",
    "Teléfono",
    "Turnos Jugados",
    "Último Turno",
    "Categoría",
    "Fidelización",
  ];

  const rows = clients.map((c) => {
    const cat = categorizeClient(c.count);
    return [
      escapeCsvCell(c.name || "Sin nombre"),
      escapeCsvCell(c.phone || "-"),
      escapeCsvCell(c.count || 0),
      escapeCsvCell(c.lastDate || "-"),
      escapeCsvCell(cat.category),
      escapeCsvCell(cat.label),
    ].join(";");
  });

  return "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
}
