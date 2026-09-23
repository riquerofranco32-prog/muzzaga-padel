"use server";

import { getDb, isFirebaseConfigured } from "../../lib/firebase";
import {
  addMinutes,
  isoAddDays,
  isoWeekday,
  slotKey,
  todayInClub,
} from "../../lib/booking";
import {
  findCourtIn,
  isValidSlotFor,
  priceFor,
  slotTimesFor,
  validateConfig,
} from "../../lib/clubConfig";
import { getClubConfig, setCachedClubConfig } from "../../lib/clubConfigServer";
import {
  bookingTotal,
  buildDailySummaries,
  computeDailyCash,
  dayOccupancy,
  isCountableBooking,
  isTestRecord,
  paidAmount,
  periodOccupancy,
  sumSummaries,
  summarizeRecords,
} from "../../lib/metrics";
import { clientKey } from "../../lib/clientsExport";
import {
  datesBetween,
  occupancyHeatmap,
  paymentMix,
  previousPeriod,
  topClients,
  topProducts,
} from "../../lib/reports";
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

const courtLabel = (court) =>
  court.type ? `${court.name} (${court.type})` : court.name;

const withBookingCode = (b) => ({
  ...b,
  bookingCode: `MUZZ-${b.id.slice(-5).toUpperCase()}`,
});

/**
 * Todo lo que pasó en un día: locks, reservas, ventas de cantina, egresos y
 * cierre. Lo comparten Agenda y Caja para que nunca calculen distinto.
 */
async function loadDayRecords(db, date) {
  const [claimsSnap, bookings, sales, expSnap, sessionSnap] = await Promise.all(
    [
      db.ref(`slotClaims/${date}`).get(),
      loadByDateRange(db, "bookings", date, date),
      loadByDateRange(db, "cantinaSales", date, date),
      db.ref(`cashExpenses/${date}`).once("value"),
      db.ref(`dailyCashSessions/${date}`).once("value"),
    ],
  );
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
  if (!ISO_DATE.test(date)) return { ok: false, error: "Fecha inválida." };
  const config = await getClubConfig();
  const slotTimes = slotTimesFor(config, date);

  let records = { claims: {}, bookings: [], sales: [], expenses: [] };
  let lastWeek = { bookings: [], sales: [] };
  let firebaseOk = false;

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      const lastWeekDate = isoAddDays(date, -7);
      const [day, lwBookings, lwSales] = await Promise.all([
        loadDayRecords(db, date),
        loadByDateRange(db, "bookings", lastWeekDate, lastWeekDate),
        loadByDateRange(db, "cantinaSales", lastWeekDate, lastWeekDate),
      ]);
      records = day;
      lastWeek = { bookings: lwBookings, sales: lwSales };
      firebaseOk = true;
    } catch (error) {
      console.warn("Aviso Firebase en Admin:", error.message);
    }
  }

  const slots = config.courts.flatMap((court) =>
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
        price: priceFor(config, date, start),
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
  // Mismo día de la semana anterior, para las comparaciones de los KPIs.
  const lastWeekSummary = summarizeRecords(lastWeek);

  return {
    ok: true,
    firebaseOk,
    date,
    courts: config.courts,
    slots,
    sales: records.sales,
    bookings: records.bookings.sort((a, b) =>
      a.startTime > b.startTime ? 1 : -1,
    ),
    summary,
    lastWeek: {
      ...lastWeekSummary,
      ocupacionPct: dayOccupancy({ ...lastWeekSummary, totalSlots }),
    },
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
    playerName,
    playerPhone,
    playersCount,
    fullCourt,
    status,
    notes,
  } = input;

  const config = await getClubConfig();
  const court = findCourtIn(config, courtId);
  if (!court) return { ok: false, error: "Cancha inválida." };
  if (!isValidSlotFor(config, date, courtId, startTime)) {
    return {
      ok: false,
      error:
        "Ese horario no existe en la grilla de ese día (¿día cerrado o bloqueado?).",
    };
  }
  const endTime = addMinutes(startTime, config.slotDurationMin);

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

    const slotPricing = priceFor(config, date, startTime);
    const booking = {
      courtId,
      courtName: courtLabel(court),
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
      priceBand: slotPricing.band,
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

const BOOKING_STATUSES = [
  "confirmado",
  "señado",
  "pagado",
  "bloqueado",
  "cancelado",
];

export async function adminUpdateStatus(bookingId, newStatus) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId) return { ok: false, error: "ID de reserva inválido." };
  if (!BOOKING_STATUSES.includes(newStatus)) {
    return { ok: false, error: "Estado inválido." };
  }
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
    if (await isCashClosed(db, date)) {
      return {
        ok: false,
        error:
          "La caja de ese día ya está cerrada. No se puede cancelar el turno.",
      };
    }
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
    return { ok: true, paymentId: paymentRef.key };
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

const CLIENT_KEY = /^(t\d{1,10}|n-[a-z0-9-]{1,80})$/;

/**
 * Listado de clientes derivado de las reservas (agrupadas por teléfono).
 * No es una colección nueva: `bookings` sigue siendo la fuente de verdad.
 */
export async function adminGetClients() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, clients: [] };

  try {
    const snap = await getDb().ref("bookings").get();
    const byKey = new Map();

    snapToList(snap).forEach((b) => {
      if (!isCountableBooking(b)) return;
      const phone = (b.playerPhone || "").trim();
      const name = (b.playerName || "Sin nombre").trim();
      const key = clientKey(phone, name);
      const date = b.date || "";
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalSpent += bookingTotal(b);
        if (date > existing.lastDate) {
          existing.lastDate = date;
          existing.name = name; // el nombre más reciente
        }
        if (date && (!existing.firstDate || date < existing.firstDate))
          existing.firstDate = date;
      } else {
        byKey.set(key, {
          key,
          name,
          phone,
          count: 1,
          totalSpent: bookingTotal(b),
          lastDate: date,
          firstDate: date,
        });
      }
    });

    const clients = Array.from(byKey.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
    return { ok: true, clients };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar el listado de clientes." };
  }
}

/** Historial de reservas, consumo en cantina y notas de un cliente. */
export async function adminGetClientDetail(key) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!CLIENT_KEY.test(key || ""))
    return { ok: false, error: "Cliente inválido." };
  if (!isFirebaseConfigured())
    return { ok: true, bookings: [], cantina: [], note: "" };

  try {
    const db = getDb();
    const [bookingsSnap, noteSnap] = await Promise.all([
      db.ref("bookings").get(),
      db.ref(`clientNotes/${key}`).once("value"),
    ]);
    const bookings = snapToList(bookingsSnap)
      .filter((b) => !isTestRecord(b))
      .filter((b) => clientKey(b.playerPhone, b.playerName) === key)
      .map((b) => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        courtName: b.courtName,
        status: b.status,
        total: bookingTotal(b),
        paid: paidAmount(b),
      }))
      .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1));

    // Consumo en cantina: ventas cargadas a la cuenta de alguno de sus turnos.
    const ids = new Set(bookings.map((b) => b.id));
    const dates = bookings
      .map((b) => b.date)
      .filter(Boolean)
      .sort();
    const cantina = dates.length
      ? (
          await loadByDateRange(
            db,
            "cantinaSales",
            dates[0],
            dates[dates.length - 1],
          )
        )
          .filter(
            (sale) => sale.chargeTo && ids.has(sale.chargeTo) && !sale.voided,
          )
          .map((sale) => ({
            id: sale.id,
            date: sale.date,
            total: Number(sale.total) || 0,
            items: sale.items || [],
            settled: sale.method !== "cuenta",
          }))
      : [];

    return { ok: true, bookings, cantina, note: noteSnap.val()?.text || "" };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar el historial del cliente." };
  }
}

export async function adminSaveClientNote(key, text) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!CLIENT_KEY.test(key || ""))
    return { ok: false, error: "Cliente inválido." };
  const note = String(text || "")
    .trim()
    .slice(0, 1000);
  try {
    await getDb()
      .ref(`clientNotes/${key}`)
      .set(note ? { text: note, updatedAt: Date.now() } : null);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo guardar la nota." };
  }
}

/**
 * Resumen día por día de un rango de fechas (turnos + cantina + ocupación),
 * con los cupos de cada día según Configuración.
 */
async function loadRangeSummaries(dates) {
  const config = await getClubConfig();
  const first = dates[0];
  const last = dates[dates.length - 1];
  let bookings = [];
  let sales = [];
  if (isFirebaseConfigured()) {
    const db = getDb();
    [bookings, sales] = await Promise.all([
      loadByDateRange(db, "bookings", first, last),
      loadByDateRange(db, "cantinaSales", first, last),
    ]);
  }
  return buildDailySummaries(dates, bookings, sales).map((d) => {
    const totalSlots =
      slotTimesFor(config, d.date).length * config.courts.length;
    const closed = totalSlots === 0;
    const closedReason = !closed
      ? null
      : config.blockedDates.includes(d.date)
        ? "Día bloqueado en Configuración"
        : "Cerrado por horario";
    const withSlots = { ...d, totalSlots, closed, closedReason };
    return { ...withSlots, ocupacionPct: dayOccupancy(withSlots) };
  });
}

/**
 * Resumen día por día de un mes calendario. Alimenta Calendario y
 * Reportes, así los dos muestran los mismos números.
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

  try {
    const days = (await loadRangeSummaries(dates)).map((d, i) => ({
      ...d,
      day: i + 1,
    }));
    return {
      ok: true,
      days,
      totals: sumSummaries(days),
      ocupacionPct: periodOccupancy(days, todayInClub()),
    };
  } catch (error) {
    return { ok: false, error: "No se pudo cargar el reporte del mes." };
  }
}

/** Ocupación de `count` días desde `fromIso`, para la tira de días de Agenda. */
export async function adminGetRangeStats(fromIso, count = 14) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const n = Math.min(62, Math.max(1, Number(count) || 14));
  const dates = Array.from({ length: n }, (_, i) =>
    isoAddDays(fromIso || todayInClub(), i),
  );
  try {
    return { ok: true, days: await loadRangeSummaries(dates) };
  } catch (error) {
    return {
      ok: false,
      error: "No se pudo cargar la ocupación de los próximos días.",
    };
  }
}

const MAX_REPORT_DAYS = 366;

/**
 * Reporte de un período arbitrario: totales vs. el período anterior del
 * mismo largo, serie diaria, heatmap día × hora, mix de pagos, top productos
 * y top clientes. Una sola lectura por colección.
 */
export async function adminGetReport(from, to) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!ISO_DATE.test(from || "") || !ISO_DATE.test(to || "") || from > to) {
    return { ok: false, error: "Elegí un período válido." };
  }
  const dates = datesBetween(from, to);
  if (dates.length > MAX_REPORT_DAYS) {
    return { ok: false, error: "El período puede tener hasta un año." };
  }
  const prev = previousPeriod(from, to);
  const prevDates = datesBetween(prev.from, prev.to);

  try {
    const config = await getClubConfig();
    let bookings = [];
    let sales = [];
    if (isFirebaseConfigured()) {
      const db = getDb();
      [bookings, sales] = await Promise.all([
        loadByDateRange(db, "bookings", prev.from, to),
        loadByDateRange(db, "cantinaSales", prev.from, to),
      ]);
    }
    const inRange = (list, a, b) =>
      list.filter((r) => r.date >= a && r.date <= b);
    const cur = {
      bookings: inRange(bookings, from, to),
      sales: inRange(sales, from, to),
    };
    const old = {
      bookings: inRange(bookings, prev.from, prev.to),
      sales: inRange(sales, prev.from, prev.to),
    };

    const withSlots = (list) =>
      list.map((d) => {
        const totalSlots =
          slotTimesFor(config, d.date).length * config.courts.length;
        const day = { ...d, totalSlots };
        return { ...day, ocupacionPct: dayOccupancy(day) };
      });
    const days = withSlots(buildDailySummaries(dates, cur.bookings, cur.sales));
    const prevDays = withSlots(
      buildDailySummaries(prevDates, old.bookings, old.sales),
    );
    const today = todayInClub();

    return {
      ok: true,
      from,
      to,
      previous: prev,
      days,
      totals: {
        ...sumSummaries(days),
        ocupacionPct: periodOccupancy(days, today),
      },
      previousTotals: {
        ...sumSummaries(prevDays),
        ocupacionPct: periodOccupancy(prevDays, today),
      },
      heatmap: occupancyHeatmap(
        config,
        dates.filter((d) => d <= today),
        cur.bookings,
      ),
      paymentMix: paymentMix(cur.bookings, cur.sales),
      topProducts: topProducts(cur.sales),
      topClients: topClients(cur.bookings),
    };
  } catch (error) {
    return { ok: false, error: "No se pudo armar el reporte." };
  }
}

const CANTINA_PAYMENT_METHODS = ["efectivo", "transferencia", "mercadopago"];
const TOP_PRODUCTS_DAYS = 30;

/**
 * Registra una venta de cantina. `method: "cuenta"` + `chargeTo` la carga a
 * la cuenta de un turno: no entra a la caja hasta que se cobra.
 */
export async function adminAddCantinaSale({
  date,
  items,
  method,
  notes,
  chargeTo,
}) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Agregá al menos un producto a la venta." };
  }
  const saleDate = date || todayInClub();
  if (!ISO_DATE.test(saleDate)) return { ok: false, error: "Fecha inválida." };
  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  const cleanItems = items
    .map((it) => ({
      name: String(it.name || "").slice(0, 80),
      price: Number(it.price) || 0,
      qty: Math.max(1, Math.round(Number(it.qty) || 1)),
    }))
    .filter((it) => it.name && it.price > 0);
  const total = cleanItems.reduce((sum, it) => sum + it.price * it.qty, 0);
  if (total <= 0) {
    return { ok: false, error: "El total de la venta debe ser mayor a cero." };
  }

  try {
    const db = getDb();
    const isOnAccount = method === "cuenta";
    if (isOnAccount) {
      const booking = chargeTo
        ? (await db.ref(`bookings/${chargeTo}`).once("value")).val()
        : null;
      if (!booking || booking.status === "cancelado") {
        return {
          ok: false,
          error: "Elegí un turno activo para cargar la cuenta.",
        };
      }
    }
    const ref = db.ref("cantinaSales").push();
    await ref.set({
      date: saleDate,
      items: cleanItems,
      total,
      method: isOnAccount
        ? "cuenta"
        : CANTINA_PAYMENT_METHODS.includes(method)
          ? method
          : "efectivo",
      ...(isOnAccount ? { chargeTo } : {}),
      notes: (notes || "").trim(),
      createdAt: Date.now(),
    });
    return { ok: true, saleId: ref.key, total };
  } catch (error) {
    return { ok: false, error: "No se pudo registrar la venta." };
  }
}

export async function adminGetCantinaSales(date) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, sales: [] };
  if (date && !ISO_DATE.test(date))
    return { ok: false, error: "Fecha inválida." };

  try {
    const db = getDb();
    const sales = date
      ? await loadByDateRange(db, "cantinaSales", date, date)
      : snapToList(await db.ref("cantinaSales").once("value"));
    sales.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { ok: true, sales };
  } catch (error) {
    return {
      ok: false,
      error: "No se pudieron cargar las ventas de cantina.",
    };
  }
}

/** Anula una venta con motivo: queda en el historial pero deja de sumar. */
export async function adminVoidCantinaSale(saleId, reason) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const why = (reason || "").trim();
  if (!saleId) return { ok: false, error: "Venta inválida." };
  if (!why) return { ok: false, error: "Indicá el motivo de la anulación." };
  try {
    const ref = getDb().ref(`cantinaSales/${saleId}`);
    // RTDB llama primero con el valor en caché (null si no hay): devolver
    // null hace que reintente con el valor real del server en vez de abortar.
    const result = await ref.transaction((sale) => {
      if (sale === null) return null;
      if (sale.voided) return; // ya anulada: aborta
      return {
        ...sale,
        voided: true,
        voidReason: why.slice(0, 120),
        voidedAt: Date.now(),
      };
    });
    if (!result.committed)
      return { ok: false, error: "Esa venta ya estaba anulada." };
    if (!result.snapshot.exists())
      return { ok: false, error: "Esa venta no existe." };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo anular la venta." };
  }
}

/** Cobra un consumo que estaba a cuenta de un turno. */
export async function adminSettleCantinaSale(saleId, method) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!saleId || !CANTINA_PAYMENT_METHODS.includes(method)) {
    return { ok: false, error: "Elegí cómo se cobró." };
  }
  try {
    const ref = getDb().ref(`cantinaSales/${saleId}`);
    const result = await ref.transaction((sale) => {
      if (sale === null) return null; // ver adminVoidCantinaSale
      if (sale.voided || sale.method !== "cuenta") return;
      return { ...sale, method, settledAt: Date.now() };
    });
    if (!result.committed || !result.snapshot.exists()) {
      return { ok: false, error: "Ese consumo ya no está a cuenta." };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "No se pudo cobrar el consumo." };
  }
}

/** Productos más vendidos de los últimos días, para la fila de accesos rápidos. */
export async function adminGetTopProducts(limit = 8) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, products: [] };
  try {
    const to = todayInClub();
    const from = isoAddDays(to, -TOP_PRODUCTS_DAYS);
    const sales = await loadByDateRange(getDb(), "cantinaSales", from, to);
    const qtyByName = new Map();
    sales
      .filter((sale) => !sale.voided && !sale.isTest)
      .forEach((sale) =>
        (sale.items || []).forEach((it) =>
          qtyByName.set(
            it.name,
            (qtyByName.get(it.name) || 0) + (Number(it.qty) || 1),
          ),
        ),
      );
    const products = [...qtyByName.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(20, Number(limit) || 8))
      .map(([name, qty]) => ({ name, qty }));
    return { ok: true, products };
  } catch (error) {
    return { ok: false, error: "No se pudieron calcular los más vendidos." };
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
  return { ok: true, config: await getClubConfig({ fresh: true }) };
}

export async function adminSaveClubConfig(input) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  const result = validateConfig(input || {});
  if (!result.ok) {
    return {
      ok: false,
      error: "Revisá los campos marcados.",
      fieldErrors: result.errors,
    };
  }

  try {
    const config = {
      ...result.config,
      paymentAlias: result.config.paymentAlias.trim(),
      paymentTitular: result.config.paymentTitular.trim(),
      clubPhone: result.config.clubPhone.trim(),
    };
    await getDb()
      .ref("clubConfig")
      .set({ ...config, updatedAt: Date.now() });
    setCachedClubConfig(config);
    return { ok: true, config };
  } catch (err) {
    return { ok: false, error: "No se pudo guardar la configuración." };
  }
}

/* ==========================================================================
   CAJA DIARIA, EGRESOS Y ARQUEO / CIERRE Z (FASE 2)
   ========================================================================== */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EXPENSE_CATEGORIES = ["hielo", "limpieza", "mantenimiento", "otros"];

async function isCashClosed(db, date) {
  const snap = await db.ref(`dailyCashSessions/${date}/closed`).once("value");
  return snap.val() === true;
}

export async function adminAddCashExpense({
  date,
  concept,
  amount,
  notes,
  category,
}) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!ISO_DATE.test(date || ""))
    return { ok: false, error: "Fecha inválida." };
  const numericAmount = Number(amount);
  if (!concept?.trim() || !numericAmount || numericAmount <= 0) {
    return { ok: false, error: "Ingresá un concepto y un monto válido." };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const db = getDb();
    if (await isCashClosed(db, date)) {
      return { ok: false, error: "La caja de ese día ya está cerrada." };
    }
    const ref = db.ref(`cashExpenses/${date}`).push();
    await ref.set({
      concept: concept.trim(),
      category: EXPENSE_CATEGORIES.includes(category) ? category : "otros",
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
  if (!ISO_DATE.test(date)) return { ok: false, error: "Fecha inválida." };
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
      closedBy: session?.closedBy || null,
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

export async function adminCloseDailyCash({
  date,
  actualCash,
  notes,
  closedBy,
}) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!ISO_DATE.test(date || ""))
    return { ok: false, error: "Fecha inválida." };
  const who = (closedBy || "").trim();
  if (!who) return { ok: false, error: "Indicá quién cierra la caja." };
  const actual = Number(actualCash);
  if (!Number.isFinite(actual) || actual < 0) {
    return { ok: false, error: "Ingresá el efectivo contado." };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  try {
    const summaryRes = await adminGetDailyCashSummary(date);
    if (!summaryRes.ok) return summaryRes;

    const expectedCash = summaryRes.summary.expectedCash;
    const difference = actual - expectedCash;
    const session = {
      closed: true,
      closedAt: Date.now(),
      closedBy: who.slice(0, 40),
      expectedCash,
      actualCash: actual,
      difference,
      notes: (notes || "").trim(),
    };

    // Transacción: dos personas cerrando a la vez no pisan un cierre ya hecho.
    const result = await getDb()
      .ref(`dailyCashSessions/${date}`)
      .transaction((current) => (current?.closed ? undefined : session));
    if (!result.committed) {
      return {
        ok: false,
        error: "Esa caja ya se cerró. Recargá para ver el cierre.",
      };
    }
    return { ok: true, difference };
  } catch (err) {
    return { ok: false, error: "No se pudo cerrar la caja." };
  }
}

/** Últimos cierres de caja, del más nuevo al más viejo. */
export async function adminGetCashHistory(limit = 30) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isFirebaseConfigured()) return { ok: true, sessions: [] };
  try {
    const snap = await getDb()
      .ref("dailyCashSessions")
      .orderByKey()
      .limitToLast(Math.min(120, Math.max(1, Number(limit) || 30)))
      .once("value");
    const sessions = snapToList(snap)
      .filter((x) => x.closed)
      .map(({ id, ...x }) => ({ date: id, ...x }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return { ok: true, sessions };
  } catch (err) {
    return { ok: false, error: "No se pudo cargar el historial de cierres." };
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
}) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!bookingId || !newDate || !newCourtId || !newStartTime) {
    return { ok: false, error: "Faltan datos del nuevo turno." };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Firebase no está configurado." };
  }

  const config = await getClubConfig();
  const court = findCourtIn(config, newCourtId);
  if (!court) return { ok: false, error: "Cancha destino inválida." };
  if (!isValidSlotFor(config, newDate, newCourtId, newStartTime)) {
    return {
      ok: false,
      error: "Ese horario no existe en la grilla del día destino.",
    };
  }

  try {
    const db = getDb();
    if (oldDate && (await isCashClosed(db, oldDate))) {
      return {
        ok: false,
        error:
          "La caja del día de origen ya está cerrada. No se puede mover el turno.",
      };
    }

    const newClaimRef = db.ref(
      `slotClaims/${newDate}/${slotKey(newCourtId, newStartTime)}`,
    );

    // 1. Intentar tomar el nuevo slot atómicamente
    const claimResult = await newClaimRef.transaction((current) => {
      if (current) return; // Ya ocupado
      return bookingId;
    });

    if (!claimResult.committed) {
      return {
        ok: false,
        error: "El horario y cancha de destino ya están ocupados.",
      };
    }

    // 2. Liberar el slot anterior
    await db
      .ref(`slotClaims/${oldDate}/${slotKey(oldCourtId, oldStartTime)}`)
      .remove();

    // 3. Actualizar la reserva conservando pagos y cliente
    await db.ref(`bookings/${bookingId}`).update({
      courtId: newCourtId,
      courtName: courtLabel(court),
      date: newDate,
      startTime: newStartTime,
      endTime: addMinutes(newStartTime, config.slotDurationMin),
      reprogrammedAt: Date.now(),
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "Error al mover la reserva." };
  }
}
