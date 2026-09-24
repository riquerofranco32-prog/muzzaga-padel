"use client";

import { useState } from "react";
import { KeyRound, ShieldAlert, X, CheckCircle, UserCheck } from "lucide-react";
import { DEFAULT_STAFF } from "../../../lib/staff";

/**
 * Modal de confirmación con PIN de seguridad para identificar
 * al integrante del equipo que ejecuta una acción crítica (eliminaciones, etc).
 */
export default function StaffPinModal({
  isOpen,
  title = "Autorización de Equipo",
  description,
  targetName,
  confirmButtonText = "Eliminar definitivamente",
  confirmButtonTone = "danger", // 'danger' | 'primary'
  onConfirm, // async ({ pin, reason, staff }) => void
  onClose,
}) {
  const [pin, setPin] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pin.trim()) {
      setError("Ingresá tu PIN de personal.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirm({ pin: pin.trim(), reason: reason.trim() });
    } catch (err) {
      setError(err?.message || "Error al procesar la autorización.");
      setLoading(false);
    }
  }

  function handleSelectQuickStaff(member) {
    setPin(member.pin);
    setError("");
  }

  return (
    <div
      className="admin-modal-backdrop"
      style={{
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="admin-modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 440,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(234, 88, 12, 0.25)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          className="admin-modal-head"
          style={{
            background: confirmButtonTone === "danger" ? "#fff1f2" : "#fff7ed",
            borderBottom: "1px solid #fed7aa",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {confirmButtonTone === "danger" ? (
              <ShieldAlert size={20} style={{ color: "#dc2626" }} />
            ) : (
              <KeyRound size={20} style={{ color: "#ea580c" }} />
            )}
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: confirmButtonTone === "danger" ? "#991b1b" : "#9a3412",
                }}
              >
                {title}
              </h3>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                Identificación de operador Muzzaga
              </span>
            </div>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {description && (
            <div
              style={{
                fontSize: 13,
                color: "var(--color-ink)",
                marginBottom: 14,
                lineHeight: 1.45,
              }}
            >
              {description}
            </div>
          )}

          {targetName && (
            <div
              style={{
                background: "rgba(0, 0, 0, 0.04)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <strong style={{ color: "#111827" }}>Elemento:</strong>{" "}
              <span>{targetName}</span>
            </div>
          )}

          {/* Accesos rápidos de equipo para recepción */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Seleccioná tu usuario o escribí tu PIN:
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DEFAULT_STAFF.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelectQuickStaff(member)}
                  className="btn btn-secondary"
                  style={{
                    padding: "3px 8px",
                    height: 26,
                    fontSize: 11,
                    borderRadius: 14,
                    background: pin === member.pin ? "#ea580c" : "#ffffff",
                    color: pin === member.pin ? "#ffffff" : "#374151",
                    borderColor: pin === member.pin ? "#c2410c" : "var(--border)",
                  }}
                >
                  {member.name.split(" ")[0]} ({member.pin})
                </button>
              ))}
            </div>
          </div>

          <div className="admin-field" style={{ marginBottom: 14 }}>
            <label className="admin-field-label" htmlFor="staff-pin-input">
              PIN de Personal (4 dígitos) *
            </label>
            <input
              id="staff-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              required
              className="admin-input-field"
              placeholder="••••"
              style={{
                fontSize: 20,
                letterSpacing: "0.3em",
                textAlign: "center",
                height: 44,
                fontFamily: "monospace",
              }}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="admin-field" style={{ marginBottom: 16 }}>
            <label className="admin-field-label" htmlFor="staff-reason-input">
              Motivo del cambio / eliminación (opcional)
            </label>
            <input
              id="staff-reason-input"
              type="text"
              className="admin-input-field"
              placeholder="ej. Cargado por error, solicitud del cliente"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12.5,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ height: 38 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading || !pin}
              style={{
                height: 38,
                background: confirmButtonTone === "danger" ? "#dc2626" : "#ea580c",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
              }}
            >
              {loading ? "Verificando..." : confirmButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
