import { NextResponse } from "next/server";
import { getDb } from "../../../lib/firebase";
import {
  COURTS,
  getSlotTimesForDate,
  slotKey,
  toISODate,
} from "../../../lib/booking";

/** GET /api/availability?date=YYYY-MM-DD */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || toISODate(new Date());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const slotTimes = getSlotTimesForDate(date);
  if (slotTimes.length === 0) {
    return NextResponse.json({ date, courts: COURTS, slots: [] });
  }

  let takenSnapshot;
  try {
    const db = getDb();
    takenSnapshot = await db.ref(`slotClaims/${date}`).get();
  } catch (error) {
    console.error("No se pudo leer disponibilidad de Firebase", error);
    return NextResponse.json(
      { error: "No se pudo cargar la disponibilidad" },
      { status: 503 },
    );
  }

  const taken = takenSnapshot.exists() ? takenSnapshot.val() : {};

  const slots = COURTS.flatMap((court) =>
    slotTimes.map(({ start, end }) => ({
      courtId: court.id,
      start,
      end,
      available: !taken[slotKey(court.id, start)],
    })),
  );

  return NextResponse.json({ date, courts: COURTS, slots });
}
