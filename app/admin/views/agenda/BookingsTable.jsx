"use client";

import { useState } from "react";
import {
  CalendarDays,
  CircleCheck,
  Clock,
  Download,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { EmptyState } from "../../ui/states";
import { bookingTotal, pendingAmount } from "../../../../lib/metrics";
import { formatARS, normalizeSearch } from "../../../../lib/format";
import { toWhatsappNumber } from "../../../../lib/phone";
import {
  IconTrash,
  STATUS_OPTIONS,
  WhatsAppMiniIcon,
  exportBookingsToCSV,
  statusClass,
} from "../../adminHelpers";

export const STATUS_FILTERS = {
  all: () => true,
  pending_payment: (b) => b.status !== "cancelado" && pendingAmount(b) > 0,
  confirmed: (b) =>
    b.status === "confirmado" ||
    (b.status !== "cancelado" && pendingAmount(b) === 0),
  cancelled: (b) => b.status === "cancelado",
};

export function matchesSearch(b, query) {
  if (!query) return true;
  return normalizeSearch(
    `${b.playerName || ""} ${b.playerPhone || ""} ${b.bookingCode || ""} ${b.courtName || ""}`,
  ).includes(normalizeSearch(query));
}

function getInitials(name) {
  if (!name) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SortIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

function SignalBars({ level }) {
  return (
    <span className={`admin-kravio-signal ${level}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/** Listado de reservas con estética Kravio Dashboard adaptado 100% a Muzzaga Pádel */
export default function BookingsTable({
  bookings,
  activeDate,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onOpenDetail,
  onStatusChange,
  onCancel,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const counts = Object.fromEntries(
    Object.entries(STATUS_FILTERS).map(([k, fn]) => [
      k,
      bookings.filter(fn).length,
    ]),
  );

  const filtered = bookings.filter(
    (b) => STATUS_FILTERS[statusFilter](b) && matchesSearch(b, searchQuery),
  );

  const filters = [
    ["all", "Todas"],
    ["pending_payment", "Con saldo"],
    ["confirmed", "Al día"],
    ...(counts.cancelled > 0 ? [["cancelled", "Canceladas"]] : []),
  ];

  const allSelected =
    filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedBookings = bookings.filter((b) => selectedIds.has(b.id));

  const getPriority = (b) => {
    if (b.status === "cancelado" || pendingAmount(b) > 0) {
      return { level: "high", label: "Con saldo" };
    }
    if (b.status === "pendiente") {
      return { level: "medium", label: "Pendiente" };
    }
    return { level: "low", label: "Al día" };
  };

  const getStatusBadge = (b) => {
    if (b.status === "cancelado") {
      return { type: "cancelled", label: "Cancelado", icon: X };
    }
    if (pendingAmount(b) > 0) {
      return { type: "review", label: "Con saldo", icon: Clock };
    }
    if (b.status === "confirmado") {
      return { type: "delivered", label: "Al día", icon: CircleCheck };
    }
    return { type: "pending", label: "Pendiente", icon: Clock };
  };

  return (
    <section className="admin-kravio-table-card">
      {/* Header del Card */}
      <div className="admin-kravio-table-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#fff7ed",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
          </div>
          <div>
            <h2
              className="admin-kravio-card-title"
              style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: "#111827" }}
            >
              Control de Turnos & Cobros
            </h2>
            <div style={{ fontSize: 11.5, color: "#6b7280" }}>
              {filtered.length} {filtered.length === 1 ? "turno cargado" : "turnos cargados"} para la fecha
            </div>
          </div>
        </div>

        <div className="admin-kravio-table-tools">
          <div className="admin-kravio-search-field">
            <Search size={14} style={{ color: "#9ca3af" }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar padelista, teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar turnos o padelistas"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="admin-kravio-filter-btn"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-label="Filtrar por estado"
            aria-expanded={showFilters}
          >
            <Filter size={13} />
            <span>Filtros</span>
            {statusFilter !== "all" && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#ea580c",
                }}
              />
            )}
          </button>

          <button
            type="button"
            className="admin-kravio-filter-btn"
            onClick={() => exportBookingsToCSV(bookings, activeDate)}
            disabled={bookings.length === 0}
            title="Exportar listado a CSV"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            className="admin-kravio-filter-btn"
            onClick={() => onOpenCreate()}
            style={{
              background: "#ea580c",
              color: "#ffffff",
              borderColor: "#c2410c",
              fontWeight: 600,
            }}
            title="Cargar nuevo turno manual"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Nuevo Turno</span>
          </button>
        </div>
      </div>

      {/* Filtros segmentados expandibles */}
      {showFilters && (
        <div
          className="admin-segmented"
          style={{ marginBottom: 14 }}
          role="group"
          aria-label="Filtrar reservas por estado"
        >
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={statusFilter === key}
              onClick={() => setStatusFilter(key)}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      )}

      {/* Tabla con Estilo Kravio & Paleta Muzzaga */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36, paddingLeft: 14 }}>
                <input
                  type="checkbox"
                  className="admin-kravio-checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todos los turnos"
                />
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Código <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Cancha & Horario <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Estado Pago <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Padelista / Cliente <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Estado <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Fecha <SortIcon />
                </span>
              </th>
              <th>
                <span className="admin-kravio-th-sort">
                  Saldo / Total <SortIcon />
                </span>
              </th>
              <th style={{ textAlign: "right", paddingRight: 16 }}>
                <span>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((b) => {
                const priority = getPriority(b);
                const statusBadge = getStatusBadge(b);
                const StatusIcon = statusBadge.icon;
                const isChecked = selectedIds.has(b.id);
                const ticketId = b.bookingCode
                  ? `#${b.bookingCode.toUpperCase()}`
                  : `#${(b.id || "").slice(-4)}`;

                return (
                  <tr
                    key={b.id}
                    style={{
                      background: isChecked ? "#fffbf7" : undefined,
                    }}
                  >
                    <td style={{ width: 36, paddingLeft: 14 }}>
                      <input
                        type="checkbox"
                        className="admin-kravio-checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(b.id)}
                        aria-label={`Seleccionar turno ${ticketId}`}
                      />
                    </td>

                    {/* Código de Turno */}
                    <td data-label="Código">
                      <strong style={{ color: "#ea580c", fontWeight: 600 }}>
                        {ticketId}
                      </strong>
                    </td>

                    {/* Cancha & Horario */}
                    <td data-label="Cancha & Horario">
                      <div>
                        <strong style={{ color: "#111827" }}>
                          {b.courtName} · {b.startTime}–{b.endTime}
                        </strong>
                        {b.isTest && (
                          <span
                            className="admin-tag is-test"
                            style={{ marginLeft: 6 }}
                          >
                            Prueba
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado Pago con Barras de Señal */}
                    <td data-label="Estado Pago">
                      <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <SignalBars level={priority.level} />
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color:
                              priority.level === "high"
                                ? "#dc2626"
                                : priority.level === "medium"
                                  ? "#d97706"
                                  : "#15803d",
                          }}
                        >
                          {priority.label}
                        </span>
                      </div>
                    </td>

                    {/* Padelista / Cliente */}
                    <td data-label="Padelista">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          className="admin-player-avatar"
                          aria-hidden="true"
                          style={{
                            width: 28,
                            height: 28,
                            fontSize: 10.5,
                            background: "#fff7ed",
                            borderColor: "#fed7aa",
                            color: "#c2410c",
                          }}
                        >
                          {getInitials(b.playerName)}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#111827",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{b.playerName}</span>
                            {b.isVip && (
                              <span
                                className="admin-tag"
                                style={{
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  borderColor: "#fde68a",
                                  fontSize: 10,
                                  padding: "1px 5px",
                                }}
                              >
                                VIP
                              </span>
                            )}
                            {b.isFirstBooking && (
                              <span
                                className="admin-tag"
                                style={{
                                  background: "#ecfdf5",
                                  color: "#047857",
                                  borderColor: "#a7f3d0",
                                  fontSize: 10,
                                  padding: "1px 5px",
                                }}
                              >
                                1er turno
                              </span>
                            )}
                          </div>
                          {b.playerPhone && (
                            <div className="admin-cell-sub">
                              {b.playerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Píldora de Estado */}
                    <td data-label="Estado">
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          className={`admin-kravio-status-pill ${statusBadge.type}`}
                        >
                          <StatusIcon size={12} strokeWidth={2.2} />
                          <span>{statusBadge.label}</span>
                        </span>

                        {/* Selector de cambio rápido de estado */}
                        <select
                          className="admin-mini-select"
                          data-status={statusClass(b.status)}
                          value={b.status}
                          aria-label={`Estado de ${b.playerName}`}
                          style={{
                            width: 18,
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            opacity: 0.45,
                          }}
                          onChange={(e) =>
                            e.target.value === "cancelado"
                              ? onCancel(b.id, b.courtId, b.startTime)
                              : onStatusChange(b.id, e.target.value)
                          }
                          title="Cambiar estado del turno"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td data-label="Fecha">
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#6b7280",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {b.date || activeDate}
                      </span>
                    </td>

                    {/* Saldo / Total */}
                    <td data-label="Saldo / Total">
                      <div>
                        {pendingAmount(b) > 0 ? (
                          <div>
                            <strong style={{ color: "#dc2626", fontSize: 12.5 }}>
                              Debe {formatARS(pendingAmount(b))}
                            </strong>
                            <div className="admin-cell-sub">
                              Total {formatARS(bookingTotal(b))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <strong style={{ color: "#15803d", fontSize: 12.5 }}>
                              Al día ({formatARS(bookingTotal(b))})
                            </strong>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td
                      data-label="Acciones"
                      style={{ textAlign: "right", paddingRight: 16 }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          className="admin-table-action-btn"
                          onClick={() => onOpenDetail(b)}
                          aria-label={`Cobros y detalle de ${b.playerName}`}
                          title="Registrar cobro o ver desglose"
                          style={{
                            background: pendingAmount(b) > 0 ? "#fff7ed" : undefined,
                            borderColor: pendingAmount(b) > 0 ? "#fed7aa" : undefined,
                            color: pendingAmount(b) > 0 ? "#ea580c" : undefined,
                            fontWeight: 600,
                          }}
                        >
                          $
                        </button>
                        {b.playerPhone && (
                          <a
                            href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}`}
                            target="_blank"
                            rel="noopener"
                            className="admin-table-action-btn"
                            aria-label={`WhatsApp a ${b.playerName}`}
                            title="Enviar WhatsApp"
                          >
                            <WhatsAppMiniIcon />
                          </a>
                        )}
                        {b.status !== "cancelado" && (
                          <button
                            type="button"
                            className="admin-table-action-btn delete"
                            onClick={() =>
                              onCancel(b.id, b.courtId, b.startTime)
                            }
                            aria-label={`Cancelar reserva de ${b.playerName}`}
                            title="Cancelar reserva"
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">
                  {searchQuery ? (
                    <EmptyState
                      icon={CalendarDays}
                      title={`Ningún turno coincide con “${searchQuery}”`}
                      text="Buscá por nombre del padelista, teléfono o código de reserva."
                      action={{
                        label: "Limpiar búsqueda",
                        onClick: () => setSearchQuery("")
                      }}
                    />
                  ) : statusFilter !== "all" ? (
                    <EmptyState
                      icon={CircleCheck}
                      title="No hay turnos con ese filtro"
                      action={{
                        label: "Ver todos",
                        onClick: () => setStatusFilter("all")
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={CalendarDays}
                      title="Sin turnos para este día"
                      text="Cuando alguien reserve desde la web pública o cargues un turno manual, aparecerá acá."
                      action={{
                        label: "+ Cargar turno manual",
                        onClick: () => onOpenCreate()
                      }}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIds.size > 0 && (
        <div
          className="admin-floating-batch-bar"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111827",
            color: "#ffffff",
            padding: "10px 20px",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 100,
            fontSize: 13,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span>
            <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? "turno seleccionado" : "turnos seleccionados"}
            {selectedBookings.reduce((sum, b) => sum + pendingAmount(b), 0) > 0 && (
              <span style={{ color: "#f87171", marginLeft: 6 }}>
                · Saldo pendiente: {formatARS(selectedBookings.reduce((sum, b) => sum + pendingAmount(b), 0))}
              </span>
            )}
          </span>
          <button
            type="button"
            className="btn btn-linear-primary"
            style={{ padding: "6px 14px", height: 32, fontSize: 12 }}
            onClick={() => exportBookingsToCSV(selectedBookings, activeDate)}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: "6px 14px",
              height: 32,
              fontSize: 12,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "none",
            }}
            onClick={() => setSelectedIds(new Set())}
          >
            Deseleccionar
          </button>
        </div>
      )}
    </section>
  );
}
