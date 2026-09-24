import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyStaffPin,
  makeStaffRecord,
  publicStaff,
  isPinTaken,
} from "../lib/staff.js";

const member = (id, pin, extra = {}) => ({
  id,
  ...makeStaffRecord({ name: `Staff ${id}`, role: "Recepción", pin }),
  ...extra,
});

test("hashed records verify without storing the PIN", () => {
  const nico = member("nico", "5555");
  assert.equal(nico.pin, undefined);
  assert.ok(nico.pinHash && nico.salt);
  const res = verifyStaffPin("5555", [nico]);
  assert.equal(res.valid, true);
  assert.equal(res.staff.id, "nico");
  assert.equal(verifyStaffPin("5556", [nico]).valid, false);
});

test("rejects malformed PINs and empty teams", () => {
  const team = [member("a", "4821")];
  assert.equal(verifyStaffPin("", team).valid, false);
  assert.equal(verifyStaffPin("12a4", team).valid, false);
  assert.equal(verifyStaffPin("123", team).valid, false);
  assert.equal(verifyStaffPin("4821", []).valid, false);
});

test("inactive members cannot authorize", () => {
  const team = [member("x", "4444", { active: false })];
  assert.equal(verifyStaffPin("4444", team).valid, false);
});

test("isPinTaken detects duplicates except for the same member", () => {
  const team = [member("a", "7070"), member("b", "8080")];
  assert.equal(isPinTaken("7070", team), true);
  assert.equal(isPinTaken("7070", team, "a"), false);
  assert.equal(isPinTaken("9090", team), false);
  // Un PIN de alguien dado de baja tampoco se reutiliza.
  assert.equal(isPinTaken("6060", [member("c", "6060", { active: false })]), true);
});

test("publicStaff never leaks PIN material", () => {
  publicStaff([member("a", "7070")]).forEach((m) => {
    assert.equal(m.pinHash, undefined);
    assert.equal(m.salt, undefined);
    assert.equal(m.active, true);
  });
});
