"use client";

import { useState } from "react";
import { depositFor, slotTimesFor } from "../../lib/clubConfig";
import { formatARS } from "../../lib/format";
import { toWhatsappNumber } from "../../lib/phone";
import { categorizeClient } from "../../lib/clientsExport";
import {
  adminMoveBooking,
  adminSettleCantinaSale,
  adminDeleteBooking,
} from "./actions";
import { onAccountTotal } from "../../lib/metrics";
import { formatDate, plural } from "../../lib/format";
import StaffPinModal from "./ui/StaffPinModal";
import {
  IconClose,
  IconTrash,
  PAYMENT_METHODS,
  WhatsAppMiniIcon,
  paidAmount,
  pendingAmount,
  buildReminderMessage,
  buildDepositRequestMessage,
  buildConfirmationMessage,
} from "./adminHelpers";

export default function BookingDetailModal({
  booking,
  clubConfig,
  clients = [],
  paymentForm,
  setPaymentForm,
  paymentSubmitting,
  onClose,
  onAddPayment,
  onRemovePayment,
  onCancel,
  onCancelSeries,
  onToggleTest,
  onMoved,
  onDeletedBooking,
  sales = [],
  onSalesChanged,
  onToast,
}) {
  const [isMoving, setIsMoving] = useState(false);
  const [isDeletePinOpen, setIsDeletePinOpen] = useState(false);
  const [moveCourtId, setMoveCourtId] = useState(booking.courtId || "cancha-1");
  const [moveDate, setMoveDate] = useState(booking.date || "");
  const [moveStartTime, setMoveStartTime] = useState(
    booking.startTime || "14:00",
  );
  const [moveSubmitting, setMoveSubmitting] = useState(false);
  const [moveError, setMoveError] = useState("");

  async function handleMoveSubmit(e) {
    e.preventDefault();
    setMoveSubmitting(true);
    setMoveError("");

    try {
      const res = await adminMoveBooking({
        bookingId: booking.id,
        oldDate: booking.date,
        oldCourtId: booking.courtId,
        oldStartTime: booking.startTime,
        newDate: moveDate,
        newCourtId: moveCourtId,
        newStartTime: moveStartTime,
      });

      if (!res.ok) {
        setMoveError(res.error || "No se pudo mover el turno.");
        setMoveSubmitting(false);
        return;
      }

      if (onMoved) {
        onMoved();
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setMoveError(err.message || "Error al procesar el traslado.");
      setMoveSubmitting(false);
    }
  }

  const clientData = (clients || []).find(
    (c) =>
      (booking.playerPhone && c.phone && c.phone === booking.playerPhone) ||
      (booking.playerName &&
        c.name &&
        c.name.toLowerCase() === booking.playerName.toLowerCase()),
  );
  const clientCat = clientData ? categorizeClient(clientData.count) : null;
  const moveTimes = moveDate
    ? slotTimesFor(clubConfig, moveDate).map((s) => s.start)
    : [];
  const accountSales = sales.filter(
    (s) => s.method === "cuenta" && s.chargeTo === booking.id && !s.voided,
  );
  // Seña según el % de Configuración (antes fija en $15.000).
  const deposit = depositFor(clubConfig, booking.total || 0);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h3 style={{ fontSize: 18, color: "var(--color-ink)", margin: 0 }}>
            Turno {formatDate(booking.date)} · {booking.startTime}
            {booking.isTest && " · PRUEBA"}
          </h3>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconClose size={14} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Organizador
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 2,
              flexWrap: "wrap",
            }}
          >
            <strong style={{ fontSize: 16 }}>{booking.playerName}</strong>
            {clientCat && clientCat.category === "VIP" && (
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#b45309",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
                title={`${plural(clientData.count, "turno jugado", "turnos jugados")} en Muzzaga`}
              >
                VIP ({plural(clientData.count, "turno", "turnos")})
              </span>
            )}
            {clientCat && clientCat.category === "Frecuente" && (
              <span
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#1d4ed8",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
                title={plural(
                  clientData.count,
                  "turno jugado",
                  "turnos jugados",
                )}
              >
                Frecuente ({clientData.count})
              </span>
            )}
            {clientCat && clientCat.category === "Nuevo" && (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#15803d",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
                title="Primer turno en el club"
              >
                1er turno
              </span>
            )}
            {booking.recurringId && (
              <span
                style={{
                  background: "rgba(124, 58, 237, 0.1)",
                  color: "#6d28d9",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
                title="Esta semana es una ocurrencia de un turno fijo"
              >
                Turno fijo
              </span>
            )}
          </div>
          {booking.playerPhone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {booking.playerPhone}
              </span>
              <a
                href={`https://wa.me/${toWhatsappNumber(booking.playerPhone)}`}
                target="_blank"
                rel="noopener"
                className="admin-table-action-btn"
                title="Chat WhatsApp"
              >
                <WhatsAppMiniIcon />
              </a>
            </div>
          )}

          {booking.playerPhone && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              <a
                href={`https://wa.me/${toWhatsappNumber(booking.playerPhone)}?text=${encodeURIComponent(buildReminderMessage(booking))}`}
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
                style={{
                  height: 26,
                  fontSize: 11,
                  padding: "0 8px",
                  textDecoration: "none",
                }}
                title="Enviar recordatorio con saldo pendiente"
              >
                Recordatorio
              </a>
              <a
                href={`https://wa.me/${toWhatsappNumber(booking.playerPhone)}?text=${encodeURIComponent(buildDepositRequestMessage(booking, clubConfig.paymentAlias, deposit))}`}
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
                style={{
                  height: 26,
                  fontSize: 11,
                  padding: "0 8px",
                  textDecoration: "none",
                }}
                title="Pedir seña con Alias bancario"
              >
                Pedir seña
              </a>
              <a
                href={`https://wa.me/${toWhatsappNumber(booking.playerPhone)}?text=${encodeURIComponent(buildConfirmationMessage(booking))}`}
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
                style={{
                  height: 26,
                  fontSize: 11,
                  padding: "0 8px",
                  textDecoration: "none",
                }}
                title="Enviar confirmación de turno"
              >
                Confirmar
              </a>
            </div>
          )}
          <div
            style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}
          >
            {booking.courtName}
          </div>
          {booking.notes && (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              Nota: {booking.notes}
            </div>
          )}
        </div>

        {/* REPROGRAMAR / MOVER TURNO SECTION */}
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: isMoving
              ? "var(--color-surface-2, #f8fafc)"
              : "transparent",
            border: "1px dashed var(--color-hairline, #e2e8f0)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Reprogramar / mover de cancha
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: 28, padding: "0 8px", fontSize: 12 }}
              onClick={() => {
                setIsMoving(!isMoving);
                setMoveError("");
              }}
            >
              {isMoving ? "Cancelar" : "Cambiar Pista u Horario"}
            </button>
          </div>

          {isMoving && (
            <form onSubmit={handleMoveSubmit} style={{ marginTop: 12 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  margin: "0 0 10px",
                }}
              >
                Mové este turno a otra cancha o fecha conservando la seña y los
                cobros ya cargados.
              </p>

              {moveError && (
                <div
                  style={{
                    padding: "6px 10px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: 12,
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  {moveError}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <label className="admin-field-label">Nueva Cancha</label>
                  <select
                    className="admin-modal-select"
                    value={moveCourtId}
                    onChange={(e) => setMoveCourtId(e.target.value)}
                  >
                    {clubConfig.courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.type ? `${c.name} (${c.type})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="admin-field-label">Nueva Fecha</label>
                  <input
                    type="date"
                    className="admin-input-field"
                    value={moveDate}
                    onChange={(e) => setMoveDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="admin-field-label">Nuevo Horario</label>
                <select
                  className="admin-modal-select"
                  value={moveStartTime}
                  onChange={(e) => setMoveStartTime(e.target.value)}
                >
                  {moveTimes.length === 0 && (
                    <option value="">Ese día el club no abre</option>
                  )}
                  {moveTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-linear-primary"
                style={{ width: "100%", height: 36, fontSize: 13 }}
                disabled={moveSubmitting}
              >
                {moveSubmitting ? "Moviendo..." : "Confirmar Traslado de Turno"}
              </button>
            </form>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
            padding: "10px 0",
            borderTop: "1px solid var(--color-hairline)",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Total
            </div>
            <strong>${(booking.total || 0).toLocaleString("es-AR")}</strong>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Cobrado
            </div>
            <strong style={{ color: "#047857" }}>
              ${paidAmount(booking).toLocaleString("es-AR")}
            </strong>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Saldo pendiente
            </div>
            <strong
              style={{
                color: pendingAmount(booking) > 0 ? "#b45309" : "#047857",
              }}
            >
              ${pendingAmount(booking).toLocaleString("es-AR")}
            </strong>
          </div>
        </div>

        <div className="admin-saldo-bar-track" style={{ marginBottom: 16 }}>
          <div
            className="admin-saldo-bar-fill"
            style={{
              width: `${
                booking.total
                  ? Math.min(
                      100,
                      Math.round((paidAmount(booking) / booking.total) * 100),
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="admin-field-label">Cobros registrados</label>
          {booking.payments && Object.keys(booking.payments).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(booking.payments)
                .sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0))
                .map(([id, p]) => (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: "var(--color-surface-2, #f4f4f5)",
                    }}
                  >
                    <span>
                      {PAYMENT_METHODS.find((m) => m.value === p.method)
                        ?.label || p.method}
                    </span>
                    <strong>${Number(p.amount).toLocaleString("es-AR")}</strong>
                    <button
                      type="button"
                      className="admin-table-action-btn delete"
                      onClick={() => onRemovePayment(id)}
                      title="Eliminar cobro"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Todavía no se registró ningún cobro.
            </div>
          )}
        </div>

        {pendingAmount(booking) > 0 && (
          <form
            onSubmit={onAddPayment}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div>
              <label className="admin-field-label">Método</label>
              <select
                className="admin-modal-select"
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-field-label">Monto</label>
              <input
                type="number"
                min="1"
                className="admin-input-field"
                style={{ width: 120 }}
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: 38, padding: "0 10px", fontSize: 12 }}
              onClick={() =>
                setPaymentForm({
                  ...paymentForm,
                  amount: String(deposit),
                })
              }
            >
              Seña {formatARS(deposit)}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: 38, padding: "0 10px", fontSize: 12 }}
              onClick={() =>
                setPaymentForm({
                  ...paymentForm,
                  amount: String(pendingAmount(booking)),
                })
              }
            >
              Saldo total
            </button>
            <button
              type="submit"
              className="btn btn-linear-primary"
              style={{ height: 38, padding: "0 14px", fontSize: 12.5 }}
              disabled={paymentSubmitting || !paymentForm.amount}
            >
              {paymentSubmitting ? "Guardando..." : "Agregar cobro"}
            </button>
          </form>
        )}

        {accountSales.length > 0 && (
          <div className="admin-account-block">
            <div className="admin-account-head">
              <strong>Consumos de cantina a cuenta</strong>
              <strong>{formatARS(onAccountTotal(accountSales))}</strong>
            </div>
            <ul>
              {accountSales.map((sale) => (
                <li key={sale.id}>
                  <span>
                    {(sale.items || [])
                      .map((it) => `${it.qty}× ${it.name}`)
                      .join(", ")}
                  </span>
                  <strong>{formatARS(sale.total)}</strong>
                  <select
                    aria-label="Cobrar consumo con"
                    value=""
                    onChange={async (e) => {
                      const how = e.target.value;
                      if (!how) return;
                      const res = await adminSettleCantinaSale(sale.id, how);
                      if (res.ok) {
                        onToast?.(`Consumo cobrado · ${formatARS(sale.total)}`);
                        onSalesChanged?.();
                      } else {
                        onToast?.(
                          res.error || "No se pudo cobrar el consumo.",
                          { tone: "error" },
                        );
                      }
                    }}
                  >
                    <option value="">Cobrar…</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}

        {booking.status !== "cancelado" && (
          <button
            type="button"
            className="admin-table-action-btn delete"
            style={{ width: "auto", padding: "6px 12px", fontSize: 12.5 }}
            onClick={() => {
              onCancel(booking.id, booking.courtId, booking.startTime);
              onClose();
            }}
          >
            <IconTrash size={12} /> Cancelar turno
          </button>
        )}

        {booking.recurringId && onCancelSeries && (
          <button
            type="button"
            className="admin-table-action-btn delete"
            style={{
              width: "auto",
              padding: "6px 12px",
              fontSize: 12.5,
              marginLeft: 8,
            }}
            title="Cancela todas las semanas futuras de este turno fijo"
            onClick={() => {
              onCancelSeries(booking.recurringId, booking.playerName);
              onClose();
            }}
          >
            <IconTrash size={12} /> Cancelar serie completa
          </button>
        )}

        <button
          type="button"
          className="admin-table-action-btn delete"
          style={{
            width: "auto",
            padding: "6px 12px",
            fontSize: 12.5,
            color: "#dc2626",
            borderColor: "#fca5a5",
            marginLeft: 8,
          }}
          onClick={() => setIsDeletePinOpen(true)}
          title="Elimina el turno definitivamente de la base requiriendo PIN"
        >
          <IconTrash size={12} /> Eliminar definitivamente
        </button>

        {onToggleTest && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              height: 32,
              padding: "4px 12px",
              fontSize: 12,
              marginLeft: 8,
            }}
            onClick={() => onToggleTest(booking)}
            title="Los datos de prueba siguen ocupando el horario pero no suman en caja, reportes ni clientes"
          >
            {booking.isTest
              ? "Contar como turno real"
              : "Marcar como dato de prueba"}
          </button>
        )}
      </div>

      {isDeletePinOpen && (
        <StaffPinModal
          isOpen={isDeletePinOpen}
          title="Eliminar Turno Definitivamente"
          description={`¿Confirmás que querés eliminar definitivamente el turno de ${booking.playerName}? Se liberará el horario de la cancha y se borrará el registro de la base.`}
          targetName={`${booking.playerName} · ${booking.courtName} (${booking.date} ${booking.startTime} hs)`}
          confirmButtonText="Eliminar Turno"
          confirmButtonTone="danger"
          onClose={() => setIsDeletePinOpen(false)}
          onConfirm={async ({ pin, reason }) => {
            const res = await adminDeleteBooking({
              bookingId: booking.id,
              pin,
              reason,
            });
            if (res.ok) {
              setIsDeletePinOpen(false);
              onToast?.(`Turno eliminado por ${res.staff}`);
              onDeletedBooking?.();
              onClose();
            } else {
              throw new Error(res.error || "No se pudo eliminar el turno.");
            }
          }}
        />
      )}
    </div>
  );
}
