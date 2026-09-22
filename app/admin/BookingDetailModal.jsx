"use client";

import { PRICE_PER_PLAYER } from "../../lib/booking";
import { toWhatsappNumber } from "../../lib/phone";
import {
  IconClose,
  IconTrash,
  PAYMENT_METHODS,
  WhatsAppMiniIcon,
  paidAmount,
  pendingAmount,
} from "./adminHelpers";

export default function BookingDetailModal({
  booking,
  paymentForm,
  setPaymentForm,
  paymentSubmitting,
  onClose,
  onAddPayment,
  onRemovePayment,
  onCancel,
}) {
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
            Turno {booking.date} · {booking.startTime} hs
          </h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <IconClose size={14} />
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Organizador
          </div>
          <strong style={{ fontSize: 15 }}>{booking.playerName}</strong>
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
                  amount: String(PRICE_PER_PLAYER),
                })
              }
            >
              Seña ${PRICE_PER_PLAYER.toLocaleString("es-AR")}
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
      </div>
    </div>
  );
}
