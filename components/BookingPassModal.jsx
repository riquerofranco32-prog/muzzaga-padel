"use client";

import { useState } from "react";

const ALIAS = "muzzaga.padel";
const CBU = "0000003100012345678901";
const TITULAR = "Muzzaga Pádel SRL (Mercado Pago)";

export default function BookingPassModal({ bookingCode, booking, whatsappUrl, onClose }) {
  const [aliasCopied, setAliasCopied] = useState(false);
  const [cbuCopied, setCbuCopied] = useState(false);

  const copyAlias = () => {
    navigator.clipboard.writeText(ALIAS);
    setAliasCopied(true);
    setTimeout(() => setAliasCopied(false), 2000);
  };

  const copyCbu = () => {
    navigator.clipboard.writeText(CBU);
    setCbuCopied(true);
    setTimeout(() => setCbuCopied(false), 2000);
  };

  if (!booking) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="digital-pass-modal" onClick={(e) => e.stopPropagation()}>
        {/* TOP PASS BAR */}
        <div className="digital-pass-card">
          <div className="pass-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="brand-mark" style={{ width: 28, height: 28, fontSize: 13 }}>M</div>
              <div>
                <strong style={{ fontSize: 14, color: "#ffffff", display: "block", lineHeight: 1.2 }}>
                  MUZZAGA PÁDEL
                </strong>
                <span style={{ fontSize: 10, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Pase Digital de Cancha
                </span>
              </div>
            </div>
            <div className="pass-code-badge">{bookingCode}</div>
          </div>

          <div className="pass-divider" />

          {/* MAIN MATCH DETAILS */}
          <div className="pass-details-grid">
            <div className="pass-detail-item">
              <span className="pass-label">Fecha</span>
              <strong className="pass-val">{booking.date}</strong>
            </div>

            <div className="pass-detail-item">
              <span className="pass-label">Horario</span>
              <strong className="pass-val">{booking.startTime} a {booking.endTime} hs</strong>
            </div>

            <div className="pass-detail-item">
              <span className="pass-label">Pista</span>
              <strong className="pass-val" style={{ color: "#38bdf8" }}>{booking.courtName}</strong>
            </div>

            <div className="pass-detail-item">
              <span className="pass-label">Titular</span>
              <strong className="pass-val">{booking.name}</strong>
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="pass-financial-row">
            <div>
              <span className="pass-label">Total Cancha (90 min)</span>
              <div className="pass-price-val">${booking.total.toLocaleString("es-AR")}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                ${Math.round(booking.total / 4).toLocaleString("es-AR")} por jugador si son cuatro
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="pass-label">Seña para Confirmar</span>
              <div className="pass-sena-val">${Math.round(booking.total / 2).toLocaleString("es-AR")}</div>
            </div>
          </div>

          {/* TRANSFER DATA BOX */}
          <div className="pass-transfer-box">
            <div className="pass-transfer-header">
              <span>💳 Datos para transferir la seña:</span>
            </div>

            <div className="pass-bank-row">
              <div>
                <span className="pass-bank-sub">Alias (Mercado Pago / Banco):</span>
                <code className="pass-alias-code">{ALIAS}</code>
              </div>
              <button
                type="button"
                className={`pass-copy-btn${aliasCopied ? " copied" : ""}`}
                onClick={copyAlias}
              >
                {aliasCopied ? "✓ ¡Copiado!" : "Copiar Alias"}
              </button>
            </div>

            <div className="pass-bank-row" style={{ marginTop: 8 }}>
              <div>
                <span className="pass-bank-sub">CBU / CVU:</span>
                <code className="pass-cbu-code">{CBU}</code>
              </div>
              <button
                type="button"
                className={`pass-copy-btn${cbuCopied ? " copied" : ""}`}
                onClick={copyCbu}
              >
                {cbuCopied ? "✓ ¡Copiado!" : "Copiar CBU"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Titular: {TITULAR}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pass-actions-col">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener"
              className="btn btn-whatsapp"
              style={{ width: "100%", justifyContent: "center", height: 44, fontSize: 14 }}
            >
              📱 Enviar comprobante por WhatsApp →
            </a>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", height: 38, fontSize: 13 }}
              onClick={onClose}
            >
              Listo, cerrar pase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
