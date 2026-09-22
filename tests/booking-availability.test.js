import test from "node:test";
import assert from "node:assert/strict";
import { isClubOpenNow, formatClubTime } from "../data/horarios.js";
import { toWhatsappNumber } from "../lib/phone.js";
import { nextDays, isClosedDay, nowInClubTimezone } from "../lib/booking.js";

test("club timezone calculations", () => {
  const now = nowInClubTimezone();
  assert.ok(now.isoDate && now.isoDate.length === 10);
  assert.match(now.isoDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(now.hhmm && now.hhmm.length === 5);
  assert.match(now.hhmm, /^\d{2}:\d{2}$/);

  const formatted = formatClubTime();
  assert.match(formatted, /^\d{2}:\d{2} hs$/);
});

test("nextDays returns requested number of days with isWeekend", () => {
  const days = nextDays(14);
  assert.equal(days.length, 14);

  for (const day of days) {
    assert.ok(day.iso);
    assert.ok(day.dayName);
    assert.ok(day.dayNumber);
    assert.ok(typeof day.isWeekend === "boolean");
    assert.ok(typeof day.closed === "boolean");
  }
});

test("phone number normalization for Argentine WhatsApp", () => {
  // Typical Catriel local: 299 597 4176 -> 5492995974176
  assert.equal(toWhatsappNumber("299 597 4176"), "5492995974176");
  assert.equal(toWhatsappNumber("2995974176"), "5492995974176");

  // With national 0 prefix: 0299-597-4176
  assert.equal(toWhatsappNumber("0299-597-4176"), "5492995974176");

  // Already with +54 9: +54 9 299 597 4176
  assert.equal(toWhatsappNumber("+54 9 299 597 4176"), "5492995974176");

  // Missing the 9 mobile digit: +54 299 597 4176
  assert.equal(toWhatsappNumber("+54 299 597 4176"), "5492995974176");

  // Empty string
  assert.equal(toWhatsappNumber(""), "");
});
