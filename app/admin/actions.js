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

/**
 * Reservas e ingresos día por día de un mes calendario completo. Alimenta
 * tanto la vista Calendario (heatmap de ocupación) como Reportes (totales +
 * exportación). Una sola lectura de `bookings`, igual que adminGetWeekStats.
 */
export async function adminGetMonthStats(year, month) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const y = Number(year);
  const m = Number(month); // 1-12
  const daysInMonth = new Date(y, m, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = toISODate(new Date(y, m - 1, d));
    const totalSlots = getSlotTimesForDate(date).length * COURTS.length;
    days.push({ date, day: d, turnos: 0, ingresos: 0, totalSlots });
  }
  const byDate = new Map(days.map((d) => [d.date, d]));

  if (!isFirebaseConfigured()) {
    return { ok: true, days, totals: { turnos: 0, ingresos: 0 } };
  }

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
    const totals = days.reduce(
      (acc, d) => ({
        turnos: acc.turnos + d.turnos,
        ingresos: acc.ingresos + d.ingresos,
      }),
      { turnos: 0, ingresos: 0 },
    );
    return { ok: true, days, totals };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar el reporte del mes." };
  }
}

const CANTINA_PAYMENT_METHODS = ["efectivo", "transferencia", "mercadopago"];

/** Registra una venta de cantina (walk-in, no ligada a un turno). */
export async function adminAddCantinaSale({ date, items, method, notes }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Agregá al menos un producto a la venta." };
  }
  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  const total = items.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0,
  );
  if (total <= 0) {
    return { ok: false, error: "El total de la venta debe ser mayor a cero." };
  }

  try {
    const db = getDb();
    const ref = db.ref("cantinaSales").push();
    await ref.set({
      date: date || toISODate(new Date()),
      items,
      total,
      method: CANTINA_PAYMENT_METHODS.includes(method) ? method : "efectivo",
      notes: (notes || "").trim(),
      createdAt: Date.now(),
    });
    return { ok: true, saleId: ref.key };
  } catch (error) {
    return { ok: false, error: "No se pudo registrar la venta." };
  }
}

export async function adminGetCantinaSales(date) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, sales: [] };

  try {
    const db = getDb();
    const snap = await db.ref("cantinaSales").get();
    const sales = [];
    if (snap.exists()) {
      Object.entries(snap.val()).forEach(([id, s]) => {
        if (!date || s.date === date) sales.push({ id, ...s });
      });
    }
    sales.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { ok: true, sales };
  } catch (error) {
    return {
      ok: false,
      error: "No se pudieron cargar las ventas de cantina.",
    };
  }
}

export async function adminDeleteCantinaSale(saleId) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!saleId) return { ok: false, error: "ID de venta inválido." };
  try {
    const db = getDb();
    await db.ref(`cantinaSales/${saleId}`).remove();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo eliminar la venta." };
  }
}

/**
 * Torneos: el admin ya inscribe parejas a mano por WhatsApp (ver
 * TorneosGallery en la landing), esto le da un lugar donde llevar esa lista
 * con quién pagó en vez de un cuaderno o un chat.
 */
export async function adminCreateTournament({ name, date, category, price }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!name?.trim()) {
    return { ok: false, error: "Ingresá un nombre para el torneo." };
  }
  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const db = getDb();
    const ref = db.ref("tournaments").push();
    await ref.set({
      name: name.trim(),
      date: date || "",
      category: (category || "").trim(),
      price: Number(price) || 0,
      status: "abierto", // 'abierto' | 'cerrado' | 'finalizado'
      createdAt: Date.now(),
    });
    return { ok: true, tournamentId: ref.key };
  } catch (error) {
    return { ok: false, error: "No se pudo crear el torneo." };
  }
}

export async function adminGetTournaments() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, tournaments: [] };

  try {
    const db = getDb();
    const snap = await db.ref("tournaments").get();
    const tournaments = [];
    if (snap.exists()) {
      Object.entries(snap.val()).forEach(([id, t]) => {
        const players = t.players
          ? Object.entries(t.players).map(([pid, p]) => ({ id: pid, ...p }))
          : [];
        const { players: _omit, ...rest } = t;
        tournaments.push({ id, ...rest, players });
      });
    }
    tournaments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { ok: true, tournaments };
  } catch (error) {
    return { ok: false, error: "No se pudieron cargar los torneos." };
  }
}

export async function adminUpdateTournamentStatus(tournamentId, status) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!tournamentId) return { ok: false, error: "Torneo inválido." };
  try {
    const db = getDb();
    await db.ref(`tournaments/${tournamentId}`).update({ status });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo actualizar el torneo." };
  }
}

export async function adminDeleteTournament(tournamentId) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!tournamentId) return { ok: false, error: "Torneo inválido." };
  try {
    const db = getDb();
    await db.ref(`tournaments/${tournamentId}`).remove();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo eliminar el torneo." };
  }
}

export async function adminAddTournamentPlayer(tournamentId, input) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { name, phone, partner } = input || {};
  if (!tournamentId || !name?.trim()) {
    return { ok: false, error: "Ingresá el nombre del jugador." };
  }
  try {
    const db = getDb();
    const ref = db.ref(`tournaments/${tournamentId}/players`).push();
    await ref.set({
      name: name.trim(),
      phone: (phone || "").trim(),
      partner: (partner || "").trim(),
      paid: false,
      createdAt: Date.now(),
    });
    return { ok: true, playerId: ref.key };
  } catch (error) {
    return { ok: false, error: "No se pudo agregar el jugador." };
  }
}

export async function adminTogglePlayerPaid(tournamentId, playerId, paid) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!tournamentId || !playerId)
    return { ok: false, error: "Datos inválidos." };
  try {
    const db = getDb();
    await db
      .ref(`tournaments/${tournamentId}/players/${playerId}`)
      .update({ paid: Boolean(paid) });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo actualizar el pago." };
  }
}

export async function adminRemoveTournamentPlayer(tournamentId, playerId) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!tournamentId || !playerId)
    return { ok: false, error: "Datos inválidos." };
  try {
    const db = getDb();
    await db.ref(`tournaments/${tournamentId}/players/${playerId}`).remove();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo quitar el jugador." };
  }
}

/* ==========================================================================
   CONFIGURACIÓN DINÁMICA DEL CLUB (FASE 1)
   ========================================================================== */

export async function adminGetClubConfig() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const fallback = {
    fullCourtPrice: 60000,
    perPlayerPrice: 15000,
    slotDurationMin: 90,
    paymentAlias: "muzzaga.padel.mp",
    paymentCbu: "0000003100010002000304",
    paymentTitular: "Muzzaga Pádel",
    clubPhone: "5492995974176",
    blockedDates: [],
  };

  if (!isFirebaseConfigured()) {
    return { ok: true, config: fallback };
  }

  try {
    const db = getDb();
    const snap = await db.ref("clubConfig").once("value");
    if (!snap.exists()) {
      return { ok: true, config: fallback };
    }
    return { ok: true, config: { ...fallback, ...snap.val() } };
  } catch (err) {
    return { ok: true, config: fallback };
  }
}

export async function adminSaveClubConfig(config) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const db = getDb();
    await db.ref("clubConfig").set({
      fullCourtPrice: Number(config.fullCourtPrice) || 60000,
      perPlayerPrice: Number(config.perPlayerPrice) || 15000,
      slotDurationMin: Number(config.slotDurationMin) || 90,
      paymentAlias: (config.paymentAlias || "").trim(),
      paymentCbu: (config.paymentCbu || "").trim(),
      paymentTitular: (config.paymentTitular || "").trim(),
      clubPhone: (config.clubPhone || "").trim(),
      blockedDates: Array.isArray(config.blockedDates) ? config.blockedDates : [],
      updatedAt: Date.now(),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "No se pudo guardar la configuración." };
  }
}

/* ==========================================================================
   CAJA DIARIA, EGRESOS Y ARQUEO / CIERRE Z (FASE 2)
   ========================================================================== */

export async function adminAddCashExpense({ date, concept, amount, notes }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const numericAmount = Number(amount);
  if (!concept?.trim() || !numericAmount || numericAmount <= 0) {
    return { ok: false, error: "Ingresá un concepto y un monto válido." };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const db = getDb();
    const ref = db.ref(`cashExpenses/${date}`).push();
    await ref.set({
      concept: concept.trim(),
      amount: numericAmount,
      notes: (notes || "").trim(),
      createdAt: Date.now(),
    });
    return { ok: true, expenseId: ref.key };
  } catch (err) {
    return { ok: false, error: "No se pudo registrar el egreso." };
  }
}

export async function adminGetDailyCashSummary(isoDate) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) {
    return {
      ok: true,
      summary: {
        date: isoDate,
        cashTurnos: 0,
        cashCantina: 0,
        totalExpenses: 0,
        transferTurnos: 0,
        transferCantina: 0,
        mpTurnos: 0,
        mpCantina: 0,
        expectedCash: 0,
        expensesList: [],
        closed: false,
      },
    };
  }

  try {
    const db = getDb();
    // 1. Obtener egresos del día
    const expSnap = await db.ref(`cashExpenses/${isoDate}`).once("value");
    const expensesList = [];
    let totalExpenses = 0;
    if (expSnap.exists()) {
      expSnap.forEach((child) => {
        const val = child.val();
        totalExpenses += val.amount || 0;
        expensesList.push({ id: child.key, ...val });
      });
    }

    // 2. Obtener reservas del día y sumar cobros según método
    const bookingsSnap = await db
      .ref("bookings")
      .orderByChild("date")
      .equalTo(isoDate)
      .once("value");

    let cashTurnos = 0;
    let transferTurnos = 0;
    let mpTurnos = 0;

    if (bookingsSnap.exists()) {
      bookingsSnap.forEach((b) => {
        const data = b.val();
        if (data.status === "cancelado") return;
        const payments = data.payments || [];
        payments.forEach((p) => {
          const amt = Number(p.amount) || 0;
          if (p.method === "efectivo") cashTurnos += amt;
          else if (p.method === "mercadopago") mpTurnos += amt;
          else transferTurnos += amt;
        });
      });
    }

    // 3. Obtener ventas de cantina del día
    const cantinaSnap = await db
      .ref("cantinaSales")
      .orderByChild("date")
      .equalTo(isoDate)
      .once("value");

    let cashCantina = 0;
    let transferCantina = 0;
    let mpCantina = 0;

    if (cantinaSnap.exists()) {
      cantinaSnap.forEach((s) => {
        const val = s.val();
        const amt = Number(val.total) || 0;
        if (val.method === "efectivo") cashCantina += amt;
        else if (val.method === "mercadopago") mpCantina += amt;
        else transferCantina += amt;
      });
    }

    // 4. Estado de cierre de caja
    const sessionSnap = await db.ref(`dailyCashSessions/${isoDate}`).once("value");
    const session = sessionSnap.exists() ? sessionSnap.val() : null;

    const expectedCash = cashTurnos + cashCantina - totalExpenses;

    return {
      ok: true,
      summary: {
        date: isoDate,
        cashTurnos,
        cashCantina,
        totalExpenses,
        transferTurnos,
        transferCantina,
        mpTurnos,
        mpCantina,
        expectedCash,
        expensesList,
        closed: Boolean(session?.closed),
        closedAt: session?.closedAt || null,
        actualCash: session?.actualCash || null,
        difference: session?.difference || null,
        notes: session?.notes || null,
      },
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function adminCloseDailyCash({ date, actualCash, notes }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const summaryRes = await adminGetDailyCashSummary(date);
    if (!summaryRes.ok) return summaryRes;

    const expectedCash = summaryRes.summary.expectedCash;
    const actual = Number(actualCash) || 0;
    const difference = actual - expectedCash;

    const db = getDb();
    await db.ref(`dailyCashSessions/${date}`).set({
      closed: true,
      closedAt: Date.now(),
      expectedCash,
      actualCash: actual,
      difference,
      notes: (notes || "").trim(),
    });

    return { ok: true, difference };
  } catch (err) {
    return { ok: false, error: "No se pudo cerrar la caja." };
  }
}

/* ==========================================================================
   REPROGRAMACIÓN Y CAMBIO RÁPIDO DE CANCHA (FASE 3)
   ========================================================================== */

export async function adminMoveBooking({
  bookingId,
  oldDate,
  oldCourtId,
  oldStartTime,
  newDate,
  newCourtId,
  newStartTime,
  newEndTime,
}) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId || !newDate || !newCourtId || !newStartTime) {
    return { ok: false, error: "Faltan datos del nuevo turno." };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  const court = findCourt(newCourtId);
  if (!court) return { ok: false, error: "Cancha destino inválida." };

  try {
    const db = getDb();
    const newClaimRef = db.ref(
      `slotClaims/${newDate}/${slotKey(newCourtId, newStartTime)}`
    );

    // 1. Intentar tomar el nuevo slot atómicamente
    const claimResult = await newClaimRef.transaction((current) => {
      if (current) return; // Ya ocupado
      return bookingId;
    });

    if (!claimResult.committed) {
      return { ok: false, error: "El horario y cancha de destino ya están ocupados." };
    }

    // 2. Liberar el slot anterior
    await db
      .ref(`slotClaims/${oldDate}/${slotKey(oldCourtId, oldStartTime)}`)
      .remove();

    // 3. Actualizar la reserva conservando pagos y cliente
    await db.ref(`bookings/${bookingId}`).update({
      courtId: newCourtId,
      courtName: `${court.name} (${court.type})`,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime || addMinutes(newStartTime, 90),
      reprogrammedAt: Date.now(),
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "Error al mover la reserva." };
  }
}

