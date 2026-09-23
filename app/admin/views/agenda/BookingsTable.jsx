"use client";

import { CalendarDays, CircleCheck, Download, Search, X } from "lucide-react";
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

const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true };

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

/** Listado de reservas del día con filtros, búsqueda y exportación. */
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

  return (
    <section className="admin-bookings">
      <div className="admin-bookings-toolbar">
        <h2 className="admin-section-title" style={{ margin: 0 }}>
          Reservas del día ({filtered.length})
        </h2>

        <div
          className="admin-segmented"
          role="group"
          aria-label="Filtrar reservas"
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

        <div className="admin-bookings-tools">
          <div className="admin-search-wrap">
            <Search {...ICON} />
            <input
              type="search"
              placeholder="Nombre, teléfono o código…"
              aria-label="Buscar reservas"
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
              >
                <X size={14} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => exportBookingsToCSV(bookings, activeDate)}
            disabled={bookings.length === 0}
          >
            <Download {...ICON} /> CSV
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Horario</th>
              <th>Cancha</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <tr key={b.id}>
                  <td data-label="Horario">
                    <strong>{b.startTime}</strong>–{b.endTime}
                  </td>
                  <td data-label="Cancha">{b.courtName}</td>
                  <td data-label="Cliente">
                    <strong>{b.playerName}</strong>
                    {b.isTest && (
                      <span className="admin-tag is-test">Prueba</span>
                    )}
                    <div className="admin-cell-sub">
                      {b.playerPhone || "Sin teléfono"} ·{" "}
                      <code>{b.bookingCode}</code>
                    </div>
                  </td>
                  <td data-label="Monto">
                    <strong>{formatARS(bookingTotal(b))}</strong>
                    {pendingAmount(b) > 0 && (
                      <div className="admin-cell-sub is-warning">
                        Debe {formatARS(pendingAmount(b))}
                      </div>
                    )}
                  </td>
                  <td data-label="Estado">
                    <select
                      className="admin-mini-select"
                      data-status={statusClass(b.status)}
                      value={b.status}
                      aria-label={`Estado del turno de ${b.playerName}`}
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
                  <td data-label="Acciones">
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="admin-table-action-btn"
                        onClick={() => onOpenDetail(b)}
                        aria-label={`Detalle y cobros de ${b.playerName}`}
                        title="Detalle y cobros"
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
                          title="WhatsApp"
                        >
                          <WhatsAppMiniIcon />
                        </a>
                      )}
                      {b.status !== "cancelado" && (
                        <button
                          type="button"
                          className="admin-table-action-btn delete"
                          onClick={() => onCancel(b.id, b.courtId, b.startTime)}
                          aria-label={`Cancelar reserva de ${b.playerName}`}
                          title="Cancelar reserva"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  {searchQuery ? (
                    <EmptyState
                      icon={CalendarDays}
                      title={`Ninguna reserva coincide con “${searchQuery}”`}
                      text="Buscá por nombre, teléfono o código de reserva."
                      action={{
                        label: "Limpiar búsqueda",
                        onClick: () => setSearchQuery(""),
                      }}
                    />
                  ) : statusFilter !== "all" ? (
                    <EmptyState
                      icon={CircleCheck}
                      title="No hay reservas con ese filtro"
                      action={{
                        label: "Ver todas",
                        onClick: () => setStatusFilter("all"),
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={CalendarDays}
                      title="Sin reservas para este día"
                      text="Cuando alguien reserve desde la web o cargues un turno a mano, aparece acá."
                      action={{
                        label: "Nueva reserva",
                        onClick: () => onOpenCreate(),
                      }}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
