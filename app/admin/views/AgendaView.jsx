"use client";

import { useState } from "react";
import { COURTS, nextDays, priceForSlot } from "../../../lib/booking";
import { toWhatsappNumber } from "../../../lib/phone";
import {
  IconClose,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  PAYMENT_METHODS,
  STATUS_OPTIONS,
  WhatsAppMiniIcon,
  paidAmount,
  pendingAmount,
  statusClass,
  exportBookingsToCSV,
} from "../adminHelpers";

const DAYS = nextDays(14);

export default function AgendaView({
  activeDate,
  setActiveDate,
  dayData,
  loading,
  searchQuery,
  setSearchQuery,
  weekStats,
  onRefresh,
  onOpenCreate,
  onOpenDetail,
  onStatusChange,
  onCancel,
}) {
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending_payment" | "confirmed" | "cancelled"

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

  const totalPendingToday = (dayData?.bookings || [])
    .filter((b) => b.status !== "cancelado")
    .reduce((sum, b) => sum + pendingAmount(b), 0);

  // Cobros del día agrupados por método (efectivo/transferencia/MP): suma
  // los payments ya cargados en cada booking, no pide nada nuevo al servidor.
  const cashCloseByMethod = PAYMENT_METHODS.map((m) => ({
    ...m,
    total: (dayData?.bookings || [])
      .filter((b) => b.status !== "cancelado")
      .flatMap((b) => Object.values(b.payments || {}))
      .filter((p) => (p.method || "efectivo") === m.value)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
  }));
  const totalCashCloseToday = cashCloseByMethod.reduce(
    (sum, m) => sum + m.total,
    0,
  );

  // Flecha de tendencia hoy vs ayer para las KPIs, a partir de los últimos
  // 7 días (weekStats siempre termina hoy, sin importar qué día mira la
  // agenda).
  function trendVs(field) {
    if (!weekStats || weekStats.length < 2) return null;
    const today = weekStats[weekStats.length - 1][field];
    const yesterday = weekStats[weekStats.length - 2][field];
    if (!yesterday) return null;
    const pct = Math.round(((today - yesterday) / yesterday) * 100);
    if (pct === 0) return null;
    return { pct, up: pct > 0 };
  }
  const ingresosTrend = trendVs("ingresos");
  const turnosTrend = trendVs("turnos");

  return (
    <>
      {/* DATE SELECTOR BAR */}
      <div className="admin-date-picker-row">
        <div className="admin-dates-scroll">
          {DAYS.map((d) => (
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
              {dayData.stats.takenSlots} / {dayData.stats.totalSlots}
              <span className="admin-kpi-sub">
                ({dayData.stats.ocupacionPct}%)
              </span>
            </div>
          </div>

          <div className="admin-kpi-card" data-tone="emerald">
            <span className="admin-kpi-label">Recaudación Estimada</span>
            <div className="admin-kpi-val" style={{ color: "#047857" }}>
              ${dayData.stats.ingresosEstimados.toLocaleString("es-AR")}
              {ingresosTrend && (
                <span
                  className={`admin-kpi-trend ${ingresosTrend.up ? "up" : "down"}`}
                >
                  {ingresosTrend.up ? "▲" : "▼"} {Math.abs(ingresosTrend.pct)}%
                </span>
              )}
            </div>
          </div>

          <div className="admin-kpi-card" data-tone="sky">
            <span className="admin-kpi-label">Horarios Disponibles</span>
            <div className="admin-kpi-val" style={{ color: "#0369a1" }}>
              {dayData.stats.libres} libres
            </div>
          </div>

          <div className="admin-kpi-card" data-tone="ink">
            <span className="admin-kpi-label">Reservas Confirmadas</span>
            <div className="admin-kpi-val">
              {dayData.bookings.length} partidos
              {turnosTrend && (
                <span
                  className={`admin-kpi-trend ${turnosTrend.up ? "up" : "down"}`}
                >
                  {turnosTrend.up ? "▲" : "▼"} {Math.abs(turnosTrend.pct)}%
                </span>
              )}
            </div>
          </div>

          <div className="admin-kpi-card">
            <span className="admin-kpi-label">Por Cobrar Hoy</span>
            <div
              className="admin-kpi-val"
              style={{ color: totalPendingToday > 0 ? "#b45309" : "#047857" }}
            >
              ${totalPendingToday.toLocaleString("es-AR")}
            </div>
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
            <h2 className="admin-section-title">Cierre de Caja del Día</h2>
            <div className="admin-cashclose-grid">
              {cashCloseByMethod.map((m) => (
                <div key={m.value} className="admin-cashclose-card">
                  <span className="admin-cashclose-label">{m.label}</span>
                  <div className="admin-cashclose-val">
                    ${m.total.toLocaleString("es-AR")}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: "var(--text-muted)",
                        marginLeft: 4,
                      }}
                    >
                      (
                      {totalCashCloseToday > 0
                        ? Math.round((m.total / totalCashCloseToday) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="admin-section-title">Recaudación de la Semana</h2>
            {weekStats ? (
              <div className="admin-week-chart">
                {(() => {
                  const max = Math.max(1, ...weekStats.map((d) => d.ingresos));
                  return weekStats.map((d, i) => (
                    <div key={d.date} className="admin-week-bar-col">
                      <span className="admin-week-bar-val">
                        {d.ingresos > 0
                          ? `$${Math.round(d.ingresos / 1000)}k`
                          : ""}
                      </span>
                      <div
                        className={`admin-week-bar${i === weekStats.length - 1 ? " is-today" : ""}`}
                        style={{
                          height: `${Math.max(4, (d.ingresos / max) * 100)}px`,
                        }}
                        title={`${d.dayLabel}: $${d.ingresos.toLocaleString("es-AR")}`}
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
            Grilla Horaria de Pistas ({activeDate})
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
                      {courtSlots.filter((s) => s.isTaken).length} reservados
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
                        <strong>{b.startTime}</strong> - {b.endTime} hs
                      </td>
                      <td>
                        <strong>{b.playerName}</strong>
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
                          $
                          {(typeof b.total === "number"
                            ? b.total
                            : b.fullCourt !== false
                              ? priceForSlot(b.date || activeDate, b.startTime)
                                  .total
                              : (b.playersCount || 4) *
                                priceForSlot(b.date || activeDate, b.startTime)
                                  .perPlayer
                          ).toLocaleString("es-AR")}
                        </strong>
                        {pendingAmount(b) > 0 && b.status !== "cancelado" && (
                          <div style={{ fontSize: 11, color: "#b45309" }}>
                            Debe ${pendingAmount(b).toLocaleString("es-AR")}
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
