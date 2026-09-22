import test from "node:test";
import assert from "node:assert/strict";
import {
  categorizeClient,
  getClientsMetrics,
  generateClientsCsv,
} from "../lib/clientsExport.js";

test("categorizeClient classifies correctly based on bookings count", () => {
  assert.equal(categorizeClient(0).category, "Nuevo");
  assert.equal(categorizeClient(1).category, "Nuevo");
  assert.equal(categorizeClient(1).badge, "🌱 Nuevo");

  assert.equal(categorizeClient(2).category, "Frecuente");
  assert.equal(categorizeClient(3).category, "Frecuente");

  assert.equal(categorizeClient(4).category, "VIP");
  assert.equal(categorizeClient(15).category, "VIP");
  assert.equal(categorizeClient(15).badge, "⭐ VIP");
});

test("getClientsMetrics calculates accurate totals and segmentation", () => {
  const mockClients = [
    { name: "Juan Perez", phone: "299111111", count: 8, lastDate: "2026-09-20" },
    { name: "Martin Gomez", phone: "299222222", count: 5, lastDate: "2026-09-21" },
    { name: "Lucia Diaz", phone: "299333333", count: 2, lastDate: "2026-09-18" },
    { name: "Sofia Lopez", phone: "299444444", count: 1, lastDate: "2026-09-10" },
  ];

  const metrics = getClientsMetrics(mockClients);
  assert.equal(metrics.totalClients, 4);
  assert.equal(metrics.vipCount, 2);
  assert.equal(metrics.frequentCount, 1);
  assert.equal(metrics.newCount, 1);
  assert.equal(metrics.totalBookings, 16);
  assert.equal(metrics.averagePerClient, "4.0");
});

test("generateClientsCsv generates valid Excel-friendly UTF-8 BOM CSV", () => {
  const mockClients = [
    { name: "Carlos Rossi; Jr.", phone: "299555555", count: 6, lastDate: "2026-09-22" },
    { name: "Ana Torres", phone: "299666666", count: 1, lastDate: "2026-09-19" },
  ];

  const csv = generateClientsCsv(mockClients);
  // Starts with UTF-8 BOM
  assert.ok(csv.startsWith("\uFEFF"));
  // Contains headers
  assert.ok(csv.includes("Nombre;Teléfono;Turnos Jugados;Último Turno;Categoría;Fidelización"));
  // Escapes semicolons in names
  assert.ok(csv.includes('"Carlos Rossi; Jr."'));
  // Contains category
  assert.ok(csv.includes("VIP"));
  assert.ok(csv.includes("Nuevo"));
});
