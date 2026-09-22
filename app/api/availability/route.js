import { NextResponse } from "next/server";
import { getDb, isFirebaseConfigured } from "../../../lib/firebase";
import {
  COURTS,
  getSlotTimesForDate,
  nowInClubTimezone,
  slotKey,
} from "../../../lib/booking";

/** GET /api/availability?date=YYYY-MM-DD */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const now = nowInClubTimezone();
  const date = searchParams.get("date") || now.isoDate;

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
      console.warn(
        "Aviso: No se pudo conectar con Firebase, usando disponibilidad libre:",
        error.message,
      );
    }
  }

  // Un turno de hoy que ya arrancó no es una opción real: sin este chequeo
  // se podían "reservar" las 14:00 estando ya a las 17:22.
  const isToday = date === now.isoDate;

  const slots = COURTS.flatMap((court) =>
    slotTimes.map(({ start, end }) => {
      const isPast = isToday && start <= now.hhmm;
      return {
        courtId: court.id,
        start,
        end,
        past: isPast,
        available: !isPast && !taken[slotKey(court.id, start)],
      };
    }),
  );

  return NextResponse.json({ date, courts: COURTS, slots });
}
