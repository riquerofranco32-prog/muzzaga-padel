"use client";

import { useState } from "react";
import { COURTS, nextDays, todayInClub } from "../../../lib/booking";
import { bookingTotal, trendPct } from "../../../lib/metrics";
import { formatARS, formatDate, formatPct, plural } from "../../../lib/format";
import { toWhatsappNumber } from "../../../lib/phone";
import {
  IconClose,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  STATUS_OPTIONS,
  WhatsAppMiniIcon,
  pendingAmount,
  statusClass,
  exportBookingsToCSV,
} from "../adminHelpers";

export default function AgendaView({
  activeDate,
  setActiveDate,
  dayData,
  loading,
  searchQuery,
  setSearchQuery,
  weekStats,
  lastWeekSameDay,
  onGoToCaja,
  onRefresh,
  onOpenCreate,
  onOpenDetail,
  onStatusChange,
  onCancel,
}) {
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending_payment" | "confirmed" | "cancelled"
  // Se calcula en cada render (no a nivel módulo) para que "Hoy" cambie a
  // la medianoche de Catriel aunque el panel quede abierto.
  const days = nextDays(14);
  const isViewingToday = activeDate === todayInClub();

  const allBookings = dayData?.bookings || [];
  const pendingCount = allBookings.filter(
    (b) => b.status !== "cancelado" && pendingAmount(b) > 0,
  ).length;
  const confirmedCount = allBookings.filter(
    (b) =>
      b.status === "confirmado" ||
      (b.status !== "cancelado" && pendingAmount(b) === 0),
  ).length;
  const cancelledCount = allBookings.filter(
    (b) => b.status === "cancelado",
  ).length;

  function bookingMatchesStatus(b) {
    if (!b) return false;
    if (statusFilter === "pending_payment") {
      return b.status !== "cancelado" && pendingAmount(b) > 0;
    }
    if (statusFilter === "confirmed") {
      return (
        b.status === "confirmado" ||
        (b.status !== "cancelado" && pendingAmount(b) === 0)
      );
    }
    if (statusFilter === "cancelled") {
      return b.status === "cancelado";
    }
    return true;
  }

  function bookingMatchesSearch(b) {
    if (!searchQuery || !b) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.playerName?.toLowerCase().includes(q) ||
      b.playerPhone?.includes(q) ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.courtName?.toLowerCase().includes(q)
    );
  }

  const filteredBookings = allBookings.filter(
    (b) => bookingMatchesStatus(b) && bookingMatchesSearch(b),
  );

  const summary = dayData?.summary;
  const cash = dayData?.cash;

  // Tendencia contra el mismo día de la semana pasada. Solo tiene sentido
  // mirando hoy: weekStats siempre termina hoy en Catriel.
  const todayStats = weekStats?.find((d) => d.isToday);
  const trend = (field) =>
    isViewingToday && todayStats && lastWeekSameDay
      ? trendPct(todayStats[field], lastWeekSameDay[field])
      : null;
  const ingresosTrend = trend("cobrado");
  const turnosTrend = trend("turnos");

  return (
    <>
      {/* DATE SELECTOR BAR */}
      <div className="admin-date-picker-row">
        <div className="admin-dates-scroll">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              className={`admin-date-tab${activeDate === d.iso ? " active" : ""}`}
              onClick={() => setActiveDate(d.iso)}
            >
              <span
                style={{
                  fontSize: 11,
                  display: "block",
                  textTransform: "uppercase",
                }}
              >
                {d.dayName}
              </span>
              <strong style={{ fontSize: 17, display: "block" }}>
                {d.dayNumber}
              </strong>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {d.monthName}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefresh}
          style={{ height: 42, padding: "8px 14px" }}
          disabled={loading}
        >
          {loading ? (
            "Actualizando..."
          ) : (
            <>
              <IconRefresh /> Refrescar
            </>
          )}
        </button>
      </div>

      {/* STATS / KPIS ROW */}
      {dayData && (
        <div className="admin-kpis-grid">
          <div className="admin-kpi-card" data-tone="orange">
            <span className="admin-kpi-label">Ocupación del Día</span>
            <div className="admin-kpi-val">
              {dayData.stats.reservados} / {dayData.stats.disponibles}
              <span className="admin-kpi-sub">
                ({formatPct(dayData.stats.ocupacionPct)})
              </span>
            </div>
          </div>

          <div className="admin-kpi-card" data-tone="emerald">
            <span className="admin-kpi-label">Cobrado Hoy</span>
            <div className="admin-kpi-val" style={{ color: "#047857" }}>
              {formatARS(cash.cobrado)}
              <TrendBadge pct={ingresosTrend} />
            </div>
            <span className="admin-kpi-sub">
              Turnos {formatARS(cash.cobradoTurnos)} · Cantina{" "}
              {formatARS(cash.cobradoCantina)}
            </span>
          </div>

          <div className="admin-kpi-card" data-tone="sky">
            <span className="admin-kpi-label">Horarios Disponibles</span>
            <div className="admin-kpi-val" style={{ color: "#0369a1" }}>
              {plural(dayData.stats.libres, "libre", "libres")}
            </div>
          </div>

          <div className="admin-kpi-card" data-tone="ink">
            <span className="admin-kpi-label">Turnos del Día</span>
            <div className="admin-kpi-val">
              {plural(summary.turnos, "turno", "turnos")}
              <TrendBadge pct={turnosTrend} />
            </div>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Por Cobrar Hoy</span>
            <div
              className="admin-kpi-val"
              style={{ color: summary.porCobrar > 0 ? "#b45309" : "#047857" }}
            >
              {formatARS(summary.porCobrar)}
            </div>
            <span className="admin-kpi-sub">
              Facturado {formatARS(summary.facturadoTurnos)}
            </span>
          </div>
        </div>
      )}

      {/* CIERRE DE CAJA + TENDENCIA SEMANAL */}
      {dayData && (
        <div
          className="admin-cashweek-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 20,
            marginTop: 24,
          }}
        >
          <div>
            <h2 className="admin-section-title">Caja del Día</h2>
            <div className="admin-cashclose-card">
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Efectivo {formatARS(cash.byMethod.efectivo)} · Transferencia{" "}
                {formatARS(cash.byMethod.transferencia)} · Mercado Pago{" "}
                {formatARS(cash.byMethod.mercadopago)} · Egresos{" "}
                {formatARS(-cash.totalExpenses)}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <strong>
                  Esperado en cajón: {formatARS(cash.expectedCash)}
                </strong>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: 32, padding: "4px 12px", fontSize: 12.5 }}
                  onClick={onGoToCaja}
                >
                  Ir a Caja →
                </button>
              </div>
              {summary.pagadosSinCobro > 0 && (
                <p style={{ fontSize: 12, color: "#b45309", marginTop: 8 }}>
                  ⚠️{" "}
                  {plural(
                    summary.pagadosSinCobro,
                    "turno marcado pagado no tiene",
                    "turnos marcados pagados no tienen",
                  )}{" "}
                  cobro cargado: no suman en caja.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="admin-section-title">Recaudación de la Semana</h2>
            {weekStats ? (
              <div className="admin-week-chart">
                {(() => {
                  const max = Math.max(1, ...weekStats.map((d) => d.cobrado));
                  return weekStats.map((d) => (
                    <div key={d.date} className="admin-week-bar-col">
                      <span className="admin-week-bar-val">
                        {d.cobrado > 0
                          ? `$${Math.round(d.cobrado / 1000)}k`
                          : ""}
                      </span>
                      <div
                        className={`admin-week-bar${d.isToday ? " is-today" : ""}`}
                        style={{
                          height: `${Math.max(4, (d.cobrado / max) * 100)}px`,
                        }}
                        title={`${d.dayLabel} ${formatDate(d.date)}: ${formatARS(d.cobrado)} (turnos ${formatARS(d.cobradoTurnos)} · cantina ${formatARS(d.cantina)})`}
                      />
                      <span className="admin-week-bar-label">{d.dayLabel}</span>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Cargando tendencia...
              </p>
            )}
          </div>
        </div>
      )}

      <div className={loading ? "admin-content-loading" : ""}>
        {/* COURT TIMELINES (CANCHA 1 VS CANCHA 2) */}
        <div style={{ marginTop: 32 }}>
          <h2 className="admin-section-title">
            Grilla Horaria de Pistas ({formatDate(activeDate, "long")})
          </h2>

          <div className="admin-courts-timeline-grid">
            {COURTS.map((court) => {
              const courtSlots =
                dayData?.slots?.filter((s) => s.courtId === court.id) || [];
              return (
                <div key={court.id} className="admin-court-col">
                  <div className="admin-court-col-header">
                    <div>
                      <strong
                        style={{ fontSize: 16, color: "var(--color-ink)" }}
                      >
                        {court.name}
                      </strong>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginLeft: 6,
                        }}
                      >
                        ({court.type})
                      </span>
                    </div>
                    <span className="badge-linear badge-emerald">
                      {plural(
                        courtSlots.filter((s) => s.isTaken).length,
                        "reservado",
                        "reservados",
                      )}
                    </span>
                  </div>

                  <div className="admin-slots-vertical-list">
                    {courtSlots.map((slot) => {
                      const b = slot.booking;
                      const isTaken = slot.isTaken;
                      const isDimmed =
                        isTaken &&
                        ((searchQuery && !bookingMatchesSearch(b)) ||
                          (statusFilter !== "all" && !bookingMatchesStatus(b)));

                      return (
                        <div
                          key={slot.slotKey}
                          className={`admin-timeline-slot${isTaken ? " occupied" : " free"}${isDimmed ? " dimmed" : ""}`}
                          data-status={
                            isTaken ? statusClass(b.status) : undefined
                          }
                        >
                          <div className="admin-slot-time-col">
                            <strong>{slot.start}</strong>
                            <span>{slot.end}</span>
                          </div>

                          <div className="admin-slot-info-col">
                            {isTaken && b ? (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <div>
                                    <strong
                                      style={{
                                        fontSize: 14,
                                        color: "var(--color-ink)",
                                      }}
                                    >
                                      {b.playerName}
                                    </strong>
                                    {b.isTest && <TestBadge />}
                                    {b.playerPhone && (
                                      <span
                                        style={{
                                          fontSize: 12,
                                          color: "var(--text-secondary)",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                        }}
                                      >
                                        <IconPhone /> {b.playerPhone}
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`admin-status-badge ${statusClass(b.status)}`}
                                  >
                                    {b.status.toUpperCase()}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    marginTop: 8,
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="admin-mini-btn"
                                    onClick={() => onOpenDetail(b)}
                                    title="Ver detalle y cobros"
                                  >
                                    $ Cobros
                                  </button>
                                  {b.playerPhone && (
                                    <a
                                      href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}?text=${encodeURIComponent(
                                        `Hola ${b.playerName}! Te escribimos de Muzzaga Pádel por tu turno del ${activeDate} a las ${slot.start} hs en ${court.name}. ¿Todo bien?`,
                                      )}`}
                                      target="_blank"
                                      rel="noopener"
                                      className="admin-mini-btn whatsapp"
                                      title="Escribir por WhatsApp"
                                    >
                                      <WhatsAppMiniIcon /> WhatsApp
                                    </a>
                                  )}

                                  <select
                                    className="admin-mini-select"
                                    data-status={statusClass(b.status)}
                                    value={b.status}
                                    onChange={(e) =>
                                      e.target.value === "cancelado"
                                        ? onCancel(b.id, court.id, slot.start)
                                        : onStatusChange(b.id, e.target.value)
                                    }
                                  >
                                    {STATUS_OPTIONS.map((o) => (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    className="admin-mini-btn cancel"
                                    onClick={() =>
                                      onCancel(b.id, court.id, slot.start)
                                    }
                                    title="Cancelar turno y liberar horario"
                                  >
                                    <IconClose size={11} /> Liberar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: "50%",
                                      background:
                                        "var(--color-hairline-strong)",
                                      display: "inline-block",
                                    }}
                                  />
                                  Horario Disponible
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{
                                    height: 28,
                                    padding: "2px 10px",
                                    fontSize: 11,
                                  }}
                                  onClick={() =>
                                    onOpenCreate(court.id, slot.start)
                                  }
                                >
                                  <IconPlus size={11} /> Asignar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED BOOKINGS TABLE */}
        <div style={{ marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2 className="admin-section-title" style={{ marginBottom: 0 }}>
              Listado de Reservas del Día ({filteredBookings.length})
            </h2>

            <div
              style={{
                display: "inline-flex",
                background: "var(--surface-muted, #f1f5f9)",
                padding: 3,
                borderRadius: 8,
                gap: 2,
              }}
            >
              <button
                type="button"
                className={`btn-secondary${statusFilter === "all" ? " active" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  background:
                    statusFilter === "all"
                      ? "var(--surface, #fff)"
                      : "transparent",
                  boxShadow:
                    statusFilter === "all"
                      ? "0 1px 2px rgba(0,0,0,0.08)"
                      : "none",
                  fontWeight: statusFilter === "all" ? 600 : 400,
                }}
                onClick={() => setStatusFilter("all")}
              >
                Todos ({allBookings.length})
              </button>
              <button
                type="button"
                className={`btn-secondary${statusFilter === "pending_payment" ? " active" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  background:
                    statusFilter === "pending_payment"
                      ? "var(--surface, #fff)"
                      : "transparent",
                  boxShadow:
                    statusFilter === "pending_payment"
                      ? "0 1px 2px rgba(0,0,0,0.08)"
                      : "none",
                  fontWeight: statusFilter === "pending_payment" ? 600 : 400,
                  color:
                    pendingCount > 0
                      ? "var(--color-primary-orange, #ff5722)"
                      : "inherit",
                }}
                onClick={() => setStatusFilter("pending_payment")}
              >
                ⚠️ Con Saldo Pendiente ({pendingCount})
              </button>
              <button
                type="button"
                className={`btn-secondary${statusFilter === "confirmed" ? " active" : ""}`}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  background:
                    statusFilter === "confirmed"
                      ? "var(--surface, #fff)"
                      : "transparent",
                  boxShadow:
                    statusFilter === "confirmed"
                      ? "0 1px 2px rgba(0,0,0,0.08)"
                      : "none",
                  fontWeight: statusFilter === "confirmed" ? 600 : 400,
                }}
                onClick={() => setStatusFilter("confirmed")}
              >
                ✓ Confirmados ({confirmedCount})
              </button>
              {cancelledCount > 0 && (
                <button
                  type="button"
                  className={`btn-secondary${statusFilter === "cancelled" ? " active" : ""}`}
                  style={{
                    padding: "4px 10px",
                    fontSize: 12,
                    borderRadius: 6,
                    background:
                      statusFilter === "cancelled"
                        ? "var(--surface, #fff)"
                        : "transparent",
                    boxShadow:
                      statusFilter === "cancelled"
                        ? "0 1px 2px rgba(0,0,0,0.08)"
                        : "none",
                    fontWeight: statusFilter === "cancelled" ? 600 : 400,
                    color: "var(--color-muted)",
                  }}
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelados ({cancelledCount})
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => exportBookingsToCSV(dayData?.bookings || [], activeDate)}
                className="btn btn-secondary"
                style={{ height: 36, fontSize: 12.5, padding: "0 12px", gap: 6 }}
                title="Descargar listado de reservas del día en CSV para Excel"
              >
                📥 Exportar CSV
              </button>

              <div className="admin-search-wrap">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o código..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                  >
                    <IconClose size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cancha</th>
                  <th>Horario</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <code style={{ color: "#0369a1", fontWeight: 600 }}>
                          {b.bookingCode}
                        </code>
                      </td>
                      <td>{b.courtName}</td>
                      <td>
                        <strong>{b.startTime}</strong>–{b.endTime}
                      </td>
                      <td>
                        <strong>{b.playerName}</strong>
                        {b.isTest && <TestBadge />}
                      </td>
                      <td>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {b.playerPhone || "-"}
                        </span>
                      </td>
                      <td>
                        <strong
                          style={{
                            color: "#047857",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {formatARS(bookingTotal(b))}
                        </strong>
                        {pendingAmount(b) > 0 && (
                          <div style={{ fontSize: 11, color: "#b45309" }}>
                            Debe {formatARS(pendingAmount(b))}
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          className="admin-mini-select"
                          data-status={statusClass(b.status)}
                          value={b.status}
                          onChange={(e) =>
                            e.target.value === "cancelado"
                              ? onCancel(b.id, b.courtId, b.startTime)
                              : onStatusChange(b.id, e.target.value)
                          }
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className="admin-table-action-btn"
                            onClick={() => onOpenDetail(b)}
                            title="Ver detalle y cobros"
                          >
                            $
                          </button>
                          {b.playerPhone && (
                            <a
                              href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}`}
                              target="_blank"
                              rel="noopener"
                              className="admin-table-action-btn"
                              title="Chat WhatsApp"
                            >
                              <WhatsAppMiniIcon />
                            </a>
                          )}
                          <button
                            type="button"
                            className="admin-table-action-btn delete"
                            onClick={() =>
                              onCancel(b.id, b.courtId, b.startTime)
                            }
                            title="Cancelar reserva"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {searchQuery ? (
                        <>
                          No hay reservas que coincidan con "{searchQuery}".{" "}
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            style={{
                              color: "var(--color-accent-orange)",
                              fontWeight: 600,
                              textDecoration: "underline",
                            }}
                          >
                            Limpiar búsqueda
                          </button>
                        </>
                      ) : (
                        "No hay reservas registradas para esta fecha."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function TrendBadge({ pct }) {
  if (pct == null) return null;
  const up = pct > 0;
  return (
    <span
      className={`admin-kpi-trend ${up ? "up" : "down"}`}
      title="vs. mismo día de la semana pasada"
    >
      {up ? "▲ +" : "▼ -"}
      {Math.abs(pct)}%
    </span>
  );
}

function TestBadge() {
  return (
    <span
      className="badge-linear badge-amber"
      style={{ fontSize: 10, padding: "1px 6px", marginLeft: 6 }}
      title="Dato de prueba: no suma en ningún total"
    >
      PRUEBA
    </span>
  );
}
