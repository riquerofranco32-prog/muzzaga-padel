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
    return {
      ok: false,
      error: "El panel no está disponible (ADMIN_PASSWORD no configurada).",
    };
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
  let firebaseOk = false;

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
      firebaseOk = true;
    } catch (error) {
      console.warn("Aviso Firebase en Admin:", error.message);
    }
  }

  // Armar matriz de horarios para Cancha 1 y Cancha 2
  const slots = COURTS.flatMap((court) =>
    slotTimes.map(({ start, end }) => {
      const key = slotKey(court.id, start);
      const bookingId = takenMap[key] || null;
      const booking = bookingId
        ? bookingsList.find((b) => b.id === bookingId)
        : null;
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
    }),
  );

  const totalSlotsCount = slots.length;
  const takenSlotsCount = slots.filter((s) => s.isTaken).length;
  const ocupacionPct =
    totalSlotsCount > 0
      ? Math.round((takenSlotsCount / totalSlotsCount) * 100)
      : 0;

  const ingresos = bookingsList.reduce((acc, b) => {
    if (b.status === "cancelado") return acc;
    if (typeof b.total === "number") return acc + b.total;
    const pricing = priceForSlot(b.date || date, b.startTime);
    const amount =
      b.fullCourt !== false
        ? pricing.total
        : (b.playersCount || 4) * pricing.perPlayer;
    return acc + amount;
  }, 0);

  return {
    ok: true,
    firebaseOk,
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

  const {
    date,
    courtId,
    startTime,
    endTime,
    playerName,
    playerPhone,
    playersCount,
    fullCourt,
    status,
    notes,
  } = input;

  const court = findCourt(courtId);
  if (!court) return { ok: false, error: "Cancha inválida." };

  if (!isFirebaseConfigured()) {
    return {
      ok: false,
      error: "Firebase no está configurado en las variables de entorno.",
    };
  }

  try {
    const db = getDb();
    const claimRef = db.ref(
      `slotClaims/${date}/${slotKey(courtId, startTime)}`,
    );
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
      total:
        fullCourt !== false
          ? slotPricing.total
          : (Number(playersCount) || 4) * slotPricing.perPlayer,
      status: status || "confirmado", // 'confirmado' | 'señado' | 'pagado' | 'bloqueado'
      notes: (notes || "").trim(),
      createdFromAdmin: true,
      createdAt: Date.now(),
    };

    await bookingRef.set(booking);
    return { ok: true, bookingId: bookingRef.key };
  } catch (error) {
    return {
      ok: false,
      error: "No se pudo guardar la reserva en la base de datos.",
    };
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

/** Registra un cobro parcial o total sobre una reserva (seña, efectivo, etc). */
export async function adminAddPayment(bookingId, method, amount) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const amt = Number(amount);
  if (!bookingId || !amt || amt <= 0) {
    return { ok: false, error: "Ingresá un monto válido." };
  }

  try {
    const db = getDb();
    const paymentRef = db.ref(`bookings/${bookingId}/payments`).push();
    await paymentRef.set({
      method: method || "efectivo",
      amount: amt,
      createdAt: Date.now(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo registrar el cobro." };
  }
}

export async function adminRemovePayment(bookingId, paymentId) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId || !paymentId) {
    return { ok: false, error: "Datos inválidos." };
  }
  try {
    const db = getDb();
    await db.ref(`bookings/${bookingId}/payments/${paymentId}`).remove();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo eliminar el cobro." };
  }
}

/**
 * Recaudación y turnos de los últimos 7 días (hoy incluido), para el
 * gráfico de la semana y las flechas de tendencia hoy-vs-ayer del
 * dashboard. Una sola lectura de `bookings` en vez de 7 llamadas a
 * getAdminDayData.
 */
export async function adminGetWeekStats() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      date: toISODate(d),
      dayLabel: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()],
      ingresos: 0,
      turnos: 0,
    });
  }
  const byDate = new Map(days.map((d) => [d.date, d]));

  if (!isFirebaseConfigured()) return { ok: true, days };

  try {
    const db = getDb();
    const snap = await db.ref("bookings").get();
    if (snap.exists()) {
      Object.values(snap.val()).forEach((b) => {
        if (b.status === "cancelado") return;
        const bucket = byDate.get(b.date);
        if (!bucket) return;
        const pricing = priceForSlot(b.date, b.startTime);
        const amount =
          typeof b.total === "number"
            ? b.total
            : b.fullCourt !== false
              ? pricing.total
              : (b.playersCount || 4) * pricing.perPlayer;
        bucket.ingresos += amount;
        bucket.turnos += 1;
      });
    }
    return { ok: true, days };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar la tendencia semanal." };
  }
}

/**
 * Listado de clientes derivado de las reservas ya guardadas (agrupadas por
 * teléfono). No agrega una colección nueva: reutiliza `bookings`, que es la
 * única fuente de verdad que ya existe.
 */
export async function adminGetClients() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, clients: [] };

  try {
    const db = getDb();
    const snap = await db.ref("bookings").get();
    const byKey = new Map();

    if (snap.exists()) {
      Object.values(snap.val()).forEach((b) => {
        if (b.status === "cancelado") return;
        const phone = (b.playerPhone || "").trim();
        const name = (b.playerName || "Sin nombre").trim();
        const key = phone || `sin-tel:${name.toLowerCase()}`;
        const existing = byKey.get(key);
        if (existing) {
          existing.count += 1;
          if ((b.date || "") > existing.lastDate) existing.lastDate = b.date;
        } else {
          byKey.set(key, { name, phone, count: 1, lastDate: b.date || "" });
        }
      });
    }

    const clients = Array.from(byKey.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
    return { ok: true, clients };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar el listado de clientes." };
  }
}
