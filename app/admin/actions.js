"use server";

import { getDb, isFirebaseConfigured } from "../../lib/firebase";
import {
  COURTS,
  findCourt,
  getSlotTimesForDate,
  priceForSlot,
  slotKey,
  toISODate,
} from "../../lib/booking";
import {
  createAdminSession,
  destroyAdminSession,
  isAdminAuthenticated,
  passwordMatches,
  requireAdmin,
} from "../../lib/adminSession";
import {
  checkLoginAllowed,
  clearLoginAttempts,
  registerFailedLogin,
} from "../../lib/adminRateLimit";

export async function verifyAdminPassword(password) {
  if (!process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "El panel no está disponible (ADMIN_PASSWORD no configurada)." };
  }

  const gate = await checkLoginAllowed();
  if (!gate.allowed) {
    return { ok: false, error: gate.error };
  }

  if (!passwordMatches(password)) {
    return { ok: false, error: await registerFailedLogin(gate.key) };
  }

  await clearLoginAttempts(gate.key);
  await createAdminSession();
  return { ok: true };
}

/** El cliente pregunta al servidor si su cookie sigue siendo válida. */
export async function checkAdminSession() {
  return { ok: await isAdminAuthenticated() };
}

export async function adminLogout() {
  await destroyAdminSession();
  return { ok: true };
}

export async function getAdminDayData(isoDate) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const date = isoDate || toISODate(new Date());
  const slotTimes = getSlotTimesForDate(date);

  let takenMap = {};
  let bookingsList = [];

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      
      // Obtener locks de horarios para el día
      const claimsSnap = await db.ref(`slotClaims/${date}`).get();
      if (claimsSnap.exists()) {
        takenMap = claimsSnap.val();
      }

      // Obtener todas las reservas y filtrar por fecha
      const bookingsSnap = await db.ref("bookings").get();
      if (bookingsSnap.exists()) {
        const all = bookingsSnap.val();
        Object.entries(all).forEach(([key, val]) => {
          if (val.date === date) {
            bookingsList.push({
              id: key,
              bookingCode: `MUZZ-${key.slice(-5).toUpperCase()}`,
              ...val,
            });
          }
        });
      }
    } catch (error) {
      console.warn("Aviso Firebase en Admin:", error.message);
    }
  }

  // Armar matriz de horarios para Cancha 1 y Cancha 2
  const slots = COURTS.flatMap((court) =>
    slotTimes.map(({ start, end }) => {
      const key = slotKey(court.id, start);
      const bookingId = takenMap[key] || null;
      const booking = bookingId ? bookingsList.find((b) => b.id === bookingId) : null;
      return {
        courtId: court.id,
        courtName: court.name,
        courtType: court.type,
        start,
        end,
        slotKey: key,
        isTaken: Boolean(bookingId),
        bookingId,
        booking,
      };
    })
  );

  const totalSlotsCount = slots.length;
  const takenSlotsCount = slots.filter((s) => s.isTaken).length;
  const ocupacionPct = totalSlotsCount > 0 ? Math.round((takenSlotsCount / totalSlotsCount) * 100) : 0;
  
  const ingresos = bookingsList.reduce((acc, b) => {
    if (b.status === "cancelado") return acc;
    if (typeof b.total === "number") return acc + b.total;
    const pricing = priceForSlot(b.date || date, b.startTime);
    const amount = b.fullCourt !== false ? pricing.total : (b.playersCount || 4) * pricing.perPlayer;
    return acc + amount;
  }, 0);

  return {
    ok: true,
    date,
    slots,
    bookings: bookingsList.sort((a, b) => (a.startTime > b.startTime ? 1 : -1)),
    stats: {
      totalSlots: totalSlotsCount,
      takenSlots: takenSlotsCount,
      libres: totalSlotsCount - takenSlotsCount,
      ocupacionPct,
      ingresosEstimados: ingresos,
    },
  };
}

export async function adminCreateManualBooking(input) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { date, courtId, startTime, endTime, playerName, playerPhone, playersCount, fullCourt, status, notes } = input;

  const court = findCourt(courtId);
  if (!court) return { ok: false, error: "Cancha inválida." };

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado en las variables de entorno." };
  }

  try {
    const db = getDb();
    const claimRef = db.ref(`slotClaims/${date}/${slotKey(courtId, startTime)}`);
    const bookingRef = db.ref("bookings").push();

    const claim = await claimRef.transaction((current) => {
      if (current) return;
      return bookingRef.key;
    });

    if (!claim.committed) {
      return { ok: false, error: "Ese horario ya se encuentra ocupado." };
    }

    const slotPricing = priceForSlot(date, startTime);
    const booking = {
      courtId,
      courtName: `${court.name} (${court.type})`,
      date,
      startTime,
      endTime,
      playerName: (playerName || "Reserva Manual").trim(),
      playerPhone: (playerPhone || "").trim(),
      playersCount: Number(playersCount) || 4,
      fullCourt: fullCourt !== false,
      total: fullCourt !== false ? slotPricing.total : (Number(playersCount) || 4) * slotPricing.perPlayer,
      status: status || "confirmado", // 'confirmado' | 'señado' | 'pagado' | 'bloqueado'
      notes: (notes || "").trim(),
      createdFromAdmin: true,
      createdAt: Date.now(),
    };

    await bookingRef.set(booking);
    return { ok: true, bookingId: bookingRef.key };
  } catch (error) {
    return { ok: false, error: "No se pudo guardar la reserva en la base de datos." };
  }
}

export async function adminUpdateStatus(bookingId, newStatus) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId) return { ok: false, error: "ID de reserva inválido." };
  try {
    const db = getDb();
    await db.ref(`bookings/${bookingId}`).update({
      status: newStatus,
      updatedAt: Date.now(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo actualizar el estado." };
  }
}

export async function adminCancelBooking(bookingId, date, courtId, startTime) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId || !date || !courtId || !startTime) {
    return { ok: false, error: "Faltan datos para cancelar el turno." };
  }

  try {
    const db = getDb();
    // Liberar lock de horario
    await db.ref(`slotClaims/${date}/${slotKey(courtId, startTime)}`).remove();
    // Marcar como cancelado
    await db.ref(`bookings/${bookingId}`).update({
      status: "cancelado",
      cancelledAt: Date.now(),
    });
    return { ok: true };
  } catch (error) {
    console.error("Error al cancelar reserva en admin", error);
    return { ok: false, error: "No se pudo cancelar el turno." };
  }
}
