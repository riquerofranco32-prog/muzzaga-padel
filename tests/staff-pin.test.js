import test from "node:test";
import assert from "node:assert/strict";
import { verifyStaffPin, getStaffList, DEFAULT_STAFF } from "../lib/staff.js";

test("verifyStaffPin matches valid team PINs", () => {
  const franco = verifyStaffPin("1234");
  assert.equal(franco.valid, true);
  assert.equal(franco.staff.name, "Franco");
  assert.equal(franco.staff.id, "franco");

  const recep = verifyStaffPin("1111");
  assert.equal(recep.valid, true);
  assert.equal(recep.staff.name, "Recepción Mañana");

  const invalid = verifyStaffPin("0000");
  assert.equal(invalid.valid, false);
  assert.equal(invalid.staff, null);

  const empty = verifyStaffPin("");
  assert.equal(empty.valid, false);
});

test("verifyStaffPin supports custom staff list", () => {
  const custom = [{ id: "profe", name: "Profe Nico", pin: "5555", role: "Profesor" }];
  const res = verifyStaffPin("5555", custom);
  assert.equal(res.valid, true);
  assert.equal(res.staff.name, "Profe Nico");

  // Old PIN fails when using custom list
  assert.equal(verifyStaffPin("1234", custom).valid, false);
});

test("getStaffList returns safe staff info", () => {
  const list = getStaffList();
  assert.equal(list.length, DEFAULT_STAFF.length);
  assert.ok(list[0].name);
  assert.ok(list[0].role);
  assert.ok(list[0].pinHint);
  assert.equal(list[0].pin, undefined); // PIN is not leaked
});
