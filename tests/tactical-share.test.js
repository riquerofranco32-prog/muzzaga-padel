import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTacticShareMessage,
  buildTacticWhatsAppUrl,
  buildRopeShareMessage,
  buildRopeWhatsAppUrl,
} from "../lib/tacticalShare.js";

test("buildTacticShareMessage creates complete WhatsApp message with all tactic components", () => {
  const mockTactic = {
    title: "Víbora con peso a la reja",
    category: "Ataque",
    difficulty: "★★★★☆",
    effectiveness: "88%",
    desc: "Impacto lateral rasante.",
    tip: "Girá los hombros rápido.",
    phases: [
      { phase: "1. Armado", desc: "Pala alta." },
      { phase: "2. Impacto", desc: "Corte lateral." },
    ],
  };

  const msg = buildTacticShareMessage(mockTactic);
  assert.ok(msg.includes("Pizarra Táctica Muzzaga Pádel"));
  assert.ok(msg.includes("Víbora con peso a la reja"));
  assert.ok(msg.includes("Ataque"));
  assert.ok(msg.includes("1. Armado"));
  assert.ok(msg.includes("Girá los hombros"));

  const url = buildTacticWhatsAppUrl(mockTactic);
  assert.ok(url.startsWith("https://wa.me/?text="));
  assert.ok(url.includes("V%C3%ADbora"));
});

test("buildRopeShareMessage formats partner synchronization tactic", () => {
  const mockRope = {
    name: "1. Transición de Saque",
    desc: "El sacador sube a la red mientras el receptor cubre el medio.",
  };

  const msg = buildRopeShareMessage(mockRope);
  assert.ok(msg.includes("Teoría de la Cuerda"));
  assert.ok(msg.includes("Transición de Saque"));
  assert.ok(msg.includes("Regla de Oro"));

  const url = buildRopeWhatsAppUrl(mockRope);
  assert.ok(url.startsWith("https://wa.me/?text="));
});
