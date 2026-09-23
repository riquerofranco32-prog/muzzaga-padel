"use server";

import { getDb, isFirebaseConfigured } from "../../lib/firebase";
import {
  COURTS,
  addMinutes,
  findCourt,
  getSlotTimesForDate,
  isoAddDays,
  isoWeekday,
  priceForSlot,
  slotKey,
  todayInClub,
} from "../../lib/booking";
import {
  buildDailySummaries,
  computeDailyCash,
  dayOccupancy,
  isCountableBooking,
  periodOccupancy,
  sumSummaries,
  summarizeRecords,
} from "../../lib/metrics";
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

/** Lista { id, ...val } de un snapshot de Realtime Database. */
function snapToList(snap) {
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }));
}

/** Registros de `path` con `date` entre dos fechas ISO (inclusive). */
async function loadByDateRange(db, path, fromIso, toIso) {
  const snap = await db
    .ref(path)
    .orderByChild("date")
    .startAt(fromIso)
    .endAt(toIso)
    .once("value");
  return snapToList(snap);
}

const withBookingCode = (b) => ({
  ...b,
  bookingCode: `MUZZ-${b.id.slice(-5).toUpperCase()}`,
});

/**
 * Todo lo que pasó en un día: locks, reservas, ventas de cantina, egresos y
 * cierre. Lo comparten Agenda y Caja para que nunca calculen distinto.
 */
async function loadDayRecords(db, date) {
  const [claimsSnap, bookings, sales, expSnap, sessionSnap] = await Promise.all([
    db.ref(`slotClaims/${date}`).get(),
    loadByDateRange(db, "bookings", date, date),
    loadByDateRange(db, "cantinaSales", date, date),
    db.ref(`cashExpenses/${date}`).once("value"),
    db.ref(`dailyCashSessions/${date}`).once("value"),
  ]);
  return {
    claims: claimsSnap.exists() ? claimsSnap.val() : {},
    bookings: bookings.map(withBookingCode),
    sales,
    expenses: snapToList(expSnap),
    session: sessionSnap.exists() ? sessionSnap.val() : null,
  };
}

export async function getAdminDayData(isoDate) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const date = isoDate || todayInClub();
  const slotTimes = getSlotTimesForDate(date);

  let records = { claims: {}, bookings: [], sales: [], expenses: [] };
  let firebaseOk = false;

  if (isFirebaseConfigured()) {
    try {
      records = await loadDayRecords(getDb(), date);
      firebaseOk = true;
    } catch (error) {
      console.warn("Aviso Firebase en Admin:", error.message);
    }
  }

  const slots = COURTS.flatMap((court) =>
    slotTimes.map(({ start, end }) => {
      const key = slotKey(court.id, start);
      const bookingId = records.claims[key] || null;
      const booking = bookingId
        ? records.bookings.find((b) => b.id === bookingId) || null
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

  const totalSlots = slots.length;
  const takenSlots = slots.filter((s) => s.isTaken).length;
  const summary = summarizeRecords(records);

  return {
    ok: true,
    firebaseOk,
    date,
    slots,
    bookings: records.bookings.sort((a, b) =>
      a.startTime > b.startTime ? 1 : -1,
    ),
    summary,
    cash: computeDailyCash(records),
    stats: {
      totalSlots,
      takenSlots,
      libres: totalSlots - takenSlots,
      reservados: summary.turnos,
      disponibles: totalSlots - summary.bloqueados,
      ocupacionPct: dayOccupancy({ ...summary, totalSlots }),
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

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/**
 * Resumen de los últimos 7 días (hoy en Catriel incluido) para el gráfico de
 * la semana, más el mismo día de la semana anterior para las tendencias.
 */
export async function adminGetWeekStats() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const today = todayInClub();
  const dates = Array.from({ length: 7 }, (_, i) => isoAddDays(today, i - 6));
  const allDates = [isoAddDays(today, -7), ...dates];
  const shape = (summaries) => ({
    ok: true,
    days: summaries.slice(1).map((d) => ({
      ...d,
      dayLabel: WEEKDAY_LABELS[isoWeekday(d.date)],
      isToday: d.date === today,
    })),
    lastWeekSameDay: summaries[0],
  });

  if (!isFirebaseConfigured()) return shape(buildDailySummaries(allDates));

  try {
    const db = getDb();
    const [bookings, sales] = await Promise.all([
      loadByDateRange(db, "bookings", allDates[0], today),
      loadByDateRange(db, "cantinaSales", allDates[0], today),
    ]);
    return shape(buildDailySummaries(allDates, bookings, sales));
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
        if (!isCountableBooking(b)) return;
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
 * Resumen día por día de un mes calendario (turnos + cantina). Alimenta
 * Calendario y Reportes, así los dos muestran los mismos números.
 */
export async function adminGetMonthStats(year, month) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const y = Number(year);
  const m = Number(month); // 1-12
  const first = `${y}-${String(m).padStart(2, "0")}-01`;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    isoAddDays(first, i),
  );
  const last = dates[dates.length - 1];

  const build = (bookings, sales) => {
    const days = buildDailySummaries(dates, bookings, sales).map((d, i) => {
      const totalSlots = getSlotTimesForDate(d.date).length * COURTS.length;
      const withSlots = { ...d, day: i + 1, totalSlots };
      return { ...withSlots, ocupacionPct: dayOccupancy(withSlots) };
    });
    return {
      ok: true,
      days,
      totals: sumSummaries(days),
      ocupacionPct: periodOccupancy(days, todayInClub()),
    };
  };

  if (!isFirebaseConfigured()) return build([], []);

  try {
    const db = getDb();
    const [bookings, sales] = await Promise.all([
      loadByDateRange(db, "bookings", first, last),
      loadByDateRange(db, "cantinaSales", first, last),
    ]);
    return build(bookings, sales);
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
      date: date || todayInClub(),
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

  const date = isoDate || todayInClub();
  let records = { bookings: [], sales: [], expenses: [], session: null };

  if (isFirebaseConfigured()) {
    try {
      records = await loadDayRecords(getDb(), date);
    } catch (err) {
      return { ok: false, error: "No se pudo calcular la caja del día." };
    }
  }

  const cash = computeDailyCash(records);
  const { session } = records;
  return {
    ok: true,
    summary: {
      date,
      cashTurnos: cash.turnos.efectivo,
      cashCantina: cash.cantina.efectivo,
      transferTurnos: cash.turnos.transferencia,
      transferCantina: cash.cantina.transferencia,
      mpTurnos: cash.turnos.mercadopago,
      mpCantina: cash.cantina.mercadopago,
      totalExpenses: cash.totalExpenses,
      expectedCash: cash.expectedCash,
      expensesList: records.expenses,
      closed: Boolean(session?.closed),
      closedAt: session?.closedAt ?? null,
      // `??` y no `||`: un cierre exacto ($0 de diferencia) es un dato válido.
      actualCash: session?.actualCash ?? null,
      difference: session?.difference ?? null,
      notes: session?.notes || null,
    },
  };
}

const TEST_FLAG_COLLECTIONS = ["bookings", "cantinaSales"];

/**
 * Marca o desmarca un registro como dato de prueba: sigue existiendo pero
 * no suma en ningún total. Desmarcar borra el campo en vez de guardar false.
 */
export async function adminSetTestFlag(collection, id, isTest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!TEST_FLAG_COLLECTIONS.includes(collection) || !id) {
    return { ok: false, error: "Registro inválido." };
  }
  try {
    await getDb()
      .ref(`${collection}/${id}/isTest`)
      .set(isTest ? true : null);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "No se pudo actualizar el registro." };
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

