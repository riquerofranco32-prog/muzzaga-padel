"use client";

import { useState } from "react";

const ALIAS = "Consultar alias en el mostrador";
const CBU = "0000003100012345678901";
const TITULAR = "Muzzaga Pádel SRL (Mercado Pago)";

export default function BookingPassModal({
  bookingCode,
  booking,
  whatsappUrl,
  onClose,
}) {
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/img/logo_badge.png"
                alt="Muzzaga"
                width={30}
                height={30}
                style={{
                  width: 30,
                  height: 30,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div>
                <strong
                  style={{
                    fontSize: 14,
                    color: "var(--text-primary)",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  MUZZAGA PÁDEL
                </strong>
                <span
                  style={{
                    fontSize: 10,
                    color: "#38bdf8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
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
              <strong className="pass-val">
                {booking.startTime} a {booking.endTime} hs
              </strong>
            </div>

            <div className="pass-detail-item">
              <span className="pass-label">Pista</span>
              <strong className="pass-val" style={{ color: "#38bdf8" }}>
                {booking.courtName}
              </strong>
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
              <div className="pass-price-val">
                ${booking.total.toLocaleString("es-AR")}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                ${Math.round(booking.total / 4).toLocaleString("es-AR")} por
                jugador si son cuatro
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="pass-label">Seña para Confirmar</span>
              <div className="pass-sena-val">
                ${Math.round(booking.total / 2).toLocaleString("es-AR")}
              </div>
            </div>
          </div>

          {/* TRANSFER DATA BOX */}
          <div className="pass-transfer-box">
            <div className="pass-transfer-header">
              <span>Datos para transferir la seña:</span>
            </div>

            <div className="pass-bank-row">
              <div>
                <span className="pass-bank-sub">
                  Alias (Mercado Pago / Banco):
                </span>
                <code className="pass-alias-code">{ALIAS}</code>
              </div>
              <button
                type="button"
                className={`pass-copy-btn${aliasCopied ? " copied" : ""}`}
                onClick={copyAlias}
              >
                {aliasCopied ? "Copiado" : "Copiar Alias"}
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
                {cbuCopied ? "Copiado" : "Copiar CBU"}
              </button>
            </div>

            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}
            >
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
              style={{
                width: "100%",
                justifyContent: "center",
                height: 44,
                fontSize: 14,
                gap: 8,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z" />
              </svg>
              Enviar comprobante por WhatsApp →
            </a>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: "100%",
                justifyContent: "center",
                height: 38,
                fontSize: 13,
              }}
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
