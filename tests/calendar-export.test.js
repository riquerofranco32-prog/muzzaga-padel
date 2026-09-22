import test from "node:test";
import assert from "node:assert/strict";
import { buildGoogleCalendarUrl, buildIcsContent } from "../lib/calendar.js";

test("buildGoogleCalendarUrl generates valid URL with required parameters", () => {
  const url = buildGoogleCalendarUrl({
    courtName: "Cancha 1 (Cristal)",
    date: "2026-10-15",
    startTime: "20:00",
    endTime: "21:30",
    bookingCode: "MZ-8492",
  });

  assert.ok(url.startsWith("https://calendar.google.com/calendar/render?"));
  assert.ok(url.includes("action=TEMPLATE"));
  assert.ok(url.includes("text=P%C3%A1del+en+Muzzaga"));
  assert.ok(url.includes("20261015T200000%2F20261015T213000"));
  assert.ok(url.includes("America%2FArgentina%2FBuenos_Aires"));
});

test("buildIcsContent generates valid iCalendar RFC-5545 format", () => {
  const ics = buildIcsContent({
    courtName: "Cancha 2",
    date: "2026-11-20",
    startTime: "18:30",
    endTime: "20:00",
    bookingCode: "MZ-1234",
    total: 60000,
  });

  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("VERSION:2.0"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("DTSTART;TZID=America/Argentina/Buenos_Aires:20261120T183000"));
  assert.ok(ics.includes("DTEND;TZID=America/Argentina/Buenos_Aires:20261120T200000"));
  assert.ok(ics.includes("SUMMARY:Pádel en Muzzaga · Cancha 2"));
  assert.ok(ics.includes("BEGIN:VALARM"));
  assert.ok(ics.includes("TRIGGER:-PT2H"));
  assert.ok(ics.includes("END:VALARM"));
  assert.ok(ics.includes("END:VEVENT"));
  assert.ok(ics.includes("END:VCALENDAR"));
});
