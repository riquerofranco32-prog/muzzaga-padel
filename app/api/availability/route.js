import { NextResponse } from "next/server";
import { getDb, isFirebaseConfigured } from "../../../lib/firebase";
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

  let taken = {};
  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      const takenSnapshot = await db.ref(`slotClaims/${date}`).get();
      if (takenSnapshot.exists()) {
        taken = takenSnapshot.val();
      }
    } catch (error) {
      console.warn("Aviso: No se pudo conectar con Firebase, usando disponibilidad libre:", error.message);
    }
  }

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
