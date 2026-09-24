import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingWindow,
  courtSchedule,
  liveAndNext,
} from "../app/admin/monitor/schedule.js";

const b = (startTime, endTime, extra = {}) => ({
  courtId: "c1",
  startTime,
  endTime,
  status: "confirmado",
  ...extra,
});

test("turno que cruza medianoche suma 1440 al fin", () => {
  assert.deepEqual(bookingWindow(b("23:30", "01:00")), {
    start: 1410,
    end: 1500,
  });
});

test("después de 00:00 sigue en juego el turno de ayer", () => {
  const sched = courtSchedule("c1", [], [b("23:30", "01:00")]);
  const { live } = liveAndNext(sched, 30); // 00:30
  assert.ok(live);
  assert.equal(live.end, 60);
});

test("bloqueos, pruebas y cancelados no aparecen en juego", () => {
  const today = [
    b("18:00", "19:30", { status: "bloqueado" }),
    b("18:00", "19:30", { isTest: true }),
    b("18:00", "19:30", { status: "cancelado" }),
  ];
  const { live } = liveAndNext(courtSchedule("c1", today), 18 * 60 + 10);
  assert.equal(live, null);
});

test("próximo turno es el siguiente que empieza", () => {
  const sched = courtSchedule("c1", [b("20:00", "21:30"), b("18:00", "19:30")]);
  const { live, next } = liveAndNext(sched, 18 * 60 + 30);
  assert.equal(live.booking.startTime, "18:00");
  assert.equal(next.booking.startTime, "20:00");
});
