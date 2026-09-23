"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, TriangleAlert } from "lucide-react";
import { SkeletonCards, SkeletonRows } from "../ui/states";
import { adminGetRangeStats } from "../actions";
import { nextDays, nowInClubTimezone, todayInClub } from "../../../lib/booking";
import { hasSlotStarted } from "../../../lib/clubConfig";
import {
  isCountableBooking,
  pendingAmount,
  trendPct,
} from "../../../lib/metrics";
import { formatARS, formatDate, formatPct, plural } from "../../../lib/format";
import DayStrip from "./agenda/DayStrip";
import CourtTimeline from "./agenda/CourtTimeline";
import WeekChart from "./agenda/WeekChart";
import BookingsTable, {
  STATUS_FILTERS,
  matchesSearch,
} from "./agenda/BookingsTable";

/** ↑12% vs. el mismo día de la semana pasada. `goodWhenDown` para "por cobrar". */
function Trend({ current, previous, goodWhenDown = false }) {
  const pct = trendPct(current, previous);
  if (pct == null) return null;
  const up = pct > 0;
  const good = goodWhenDown ? !up : up;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={`admin-kpi-trend ${good ? "up" : "down"}`}
      title="vs. mismo día de la semana pasada"
    >
      <Icon size={12} strokeWidth={2} aria-hidden />
      {up ? "+" : "-"}
      {Math.abs(pct)}%<span className="sr-only"> vs. semana pasada</span>
    </span>
  );
}

export default function AgendaView({
  activeDate,
  setActiveDate,
  dayData,
  clubConfig,
  loading,
  searchQuery,
  setSearchQuery,
  weekStats,
  onGoToCaja,
  onRefresh,
  onOpenCreate,
  onOpenDetail,
  onStatusChange,
  onCancel,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [rangeStats, setRangeStats] = useState(null);
  const todayIso = todayInClub();
  const now = nowInClubTimezone();
  // En cada render (no a nivel módulo): "Hoy" cambia a la medianoche de Catriel.
  const days = nextDays(14);

  // Ocupación de los próximos 14 días para la tira; se refresca con cada cambio del día.
  useEffect(() => {
    let cancelled = false;
    adminGetRangeStats(todayIso, 14).then((res) => {
      if (!cancelled && res.ok) setRangeStats(res.days);
    });
    return () => {
      cancelled = true;
    };
  }, [dayData, todayIso]);

  const strip = (
    <DayStrip
      days={days}
      rangeStats={rangeStats}
      activeDate={activeDate}
      todayIso={todayIso}
      loading={loading}
      onSelect={setActiveDate}
      onRefresh={onRefresh}
    />
  );

  if (!dayData) {
    return (
      <>
        {strip}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SkeletonCards count={4} />
          <SkeletonRows count={7} height={64} />
        </div>
      </>
    );
  }

  const { summary, cash, stats, lastWeek } = dayData;
  const bookings = dayData.bookings || [];
  const pendingBookings = bookings.filter(
    (b) => isCountableBooking(b) && pendingAmount(b) > 0,
  ).length;

  // Próximo turno: el primer reservado que todavía no arrancó (o el primero
  // del día si se mira una fecha futura). Los slots vienen por cancha; el
  // orden del día es el de la primera aparición de cada horario.
  const rowOrder = [...new Set(dayData.slots.map((s) => s.start))];
  const nextSlot =
    dayData.slots
      .filter((s) => s.booking && isCountableBooking(s.booking))
      .filter((s) => !hasSlotStarted(clubConfig, activeDate, s.start, now))
      .sort((a, b) => rowOrder.indexOf(a.start) - rowOrder.indexOf(b.start))[0] || null;
  const courtName = (id) => dayData.courts.find((c) => c.id === id)?.name || id;

  const isDimmed = (b) =>
    (searchQuery && !matchesSearch(b, searchQuery)) ||
    (statusFilter !== "all" && !STATUS_FILTERS[statusFilter](b));

  const occupancy = stats.ocupacionPct;

  return (
    <>
      {strip}

      <div className={loading ? "admin-content-loading" : ""}>
        {/* KPIs */}
        <div className="admin-kpis-grid admin-kpis-4">
          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Ocupación</span>
            <div className="admin-kpi-val">
              {stats.reservados}/{stats.disponibles}
              <span className="admin-kpi-sub">{formatPct(occupancy)}</span>
              <Trend current={occupancy} previous={lastWeek?.ocupacionPct} />
            </div>
            <div
              className="admin-progress"
              role="progressbar"
              aria-label="Ocupación del día"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={occupancy ?? 0}
            >
              <span style={{ width: `${occupancy ?? 0}%` }} />
            </div>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Ingresos del día</span>
            <div className="admin-kpi-val">
              {formatARS(cash.cobrado)}
              <Trend current={cash.cobrado} previous={lastWeek?.cobrado} />
            </div>
            <span className="admin-kpi-sub">
              Turnos {formatARS(cash.cobradoTurnos)} · Cantina{" "}
              {formatARS(cash.cobradoCantina)}
            </span>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Por cobrar</span>
            <div
              className="admin-kpi-val"
              style={{
                color: summary.porCobrar > 0 ? "var(--warning)" : "var(--text)",
              }}
            >
              {formatARS(summary.porCobrar)}
              <Trend
                current={summary.porCobrar}
                previous={lastWeek?.porCobrar}
                goodWhenDown
              />
            </div>
            <span className="admin-kpi-sub">
              {pendingBookings > 0
                ? plural(
                    pendingBookings,
                    "reserva pendiente",
                    "reservas pendientes",
                  )
                : "Todo cobrado"}
            </span>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Próximo turno</span>
            {nextSlot ? (
              <>
                <div className="admin-kpi-val">{nextSlot.start}</div>
                <span className="admin-kpi-sub">
                  {courtName(nextSlot.courtId)} · {nextSlot.booking.playerName}
                </span>
              </>
            ) : (
              <>
                <div
                  className="admin-kpi-val"
                  style={{ color: "var(--text-muted)" }}
                >
                  Sin turnos
                </div>
                <span className="admin-kpi-sub">
                  {stats.totalSlots === 0
                    ? "El club no abre este día"
                    : "No quedan turnos reservados"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* GRILLA */}
        <section style={{ marginTop: 24 }}>
          <h2 className="admin-section-title">
            Grilla del {formatDate(activeDate, "long")}
          </h2>
          {stats.totalSlots === 0 ? (
            <div className="admin-settings-card admin-closed-day">
              El club no abre este día (cerrado por horario o día bloqueado en
              Configuración).
            </div>
          ) : (
            <CourtTimeline
              courts={dayData.courts}
              slots={dayData.slots}
              activeDate={activeDate}
              clubConfig={clubConfig}
              now={now}
              isDimmed={isDimmed}
              onAssign={onOpenCreate}
              onOpenDetail={onOpenDetail}
              onCancel={onCancel}
            />
          )}
          <ul
            className="admin-timeline-legend"
            aria-label="Referencias de colores"
          >
            <li data-state="pendiente">Pendiente de pago</li>
            <li data-state="senado">Seña pagada</li>
            <li data-state="pagado">Pagado completo</li>
            <li data-state="bloqueado">Bloqueado</li>
          </ul>
        </section>

        {/* CAJA + SEMANA */}
        <div className="admin-agenda-split">
          <section>
            <h2 className="admin-section-title">Caja del día</h2>
            <div className="admin-cashclose-card admin-cash-line">
              <span>
                Efectivo {formatARS(cash.byMethod.efectivo)} · Transferencia{" "}
                {formatARS(cash.byMethod.transferencia)} · MP{" "}
                {formatARS(cash.byMethod.mercadopago)} · Egresos{" "}
                {formatARS(-cash.totalExpenses)}
              </span>
              <span className="admin-cash-line-total">
                <strong>En cajón: {formatARS(cash.expectedCash)}</strong>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onGoToCaja}
                >
                  Ir a Caja →
                </button>
              </span>
              {summary.pagadosSinCobro > 0 && (
                <p className="admin-alert">
                  <TriangleAlert size={14} strokeWidth={1.75} aria-hidden />
                  {plural(
                    summary.pagadosSinCobro,
                    "turno marcado pagado no tiene",
                    "turnos marcados pagados no tienen",
                  )}{" "}
                  cobro cargado: no suman en caja.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="admin-section-title">Recaudación de la semana</h2>
            {weekStats ? (
              <WeekChart days={weekStats} />
            ) : (
              <SkeletonRows count={1} height={180} />
            )}
          </section>
        </div>

        <BookingsTable
          bookings={bookings}
          activeDate={activeDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreate={onOpenCreate}
          onOpenDetail={onOpenDetail}
          onStatusChange={onStatusChange}
          onCancel={onCancel}
        />
      </div>
    </>
  );
}
