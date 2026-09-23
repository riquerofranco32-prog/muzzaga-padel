/**
 * Lógica pura de categorización, métricas y exportación CSV de clientes de Muzzaga Pádel.
 * Sin dependencias del DOM para poder ser testeado con node:test.
 */

import { normalizeSearch } from "./format.js";

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

/** Días sin jugar a partir de los cuales un cliente pasa a "Inactivo". */
export const INACTIVE_AFTER_DAYS = 30;

/**
 * Clave estable de un cliente, apta como ruta de Realtime Database (sin
 * . # $ [ ] /): los dígitos del teléfono, o el nombre normalizado si no hay.
 */
export function clientKey(phone, name) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits) return `t${digits.slice(-10)}`;
  const slug = normalizeSearch(name || "sin-nombre")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `n-${slug || "sin-nombre"}`;
}

/** ¿Hace más de INACTIVE_AFTER_DAYS que no juega? */
export function isInactiveClient(client, todayIso) {
  if (!client?.lastDate) return false;
  const days =
    (Date.parse(`${todayIso}T00:00:00Z`) -
      Date.parse(`${client.lastDate}T00:00:00Z`)) /
    86_400_000;
  return days > INACTIVE_AFTER_DAYS;
}
