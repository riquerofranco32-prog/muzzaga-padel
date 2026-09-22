"use client";

import { useEffect, useState } from "react";
import { adminGetClubConfig, adminSaveClubConfig } from "../actions";

export default function ConfiguracionView({ onExpiredSession }) {
  const [config, setConfig] = useState({
    fullCourtPrice: 60000,
    perPlayerPrice: 15000,
    slotDurationMin: 90,
    paymentAlias: "",
    paymentCbu: "",
    paymentTitular: "",
    clubPhone: "",
    blockedDates: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const res = await adminGetClubConfig();
    setLoading(false);
    if (res.ok) {
      setConfig(res.config);
    } else if (onExpiredSession) {
      onExpiredSession(res);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    const res = await adminSaveClubConfig(config);
    setSaving(false);
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo guardar la configuración.");
    }
  }

  function addBlockedDate() {
    if (!newBlockedDate) return;
    if (config.blockedDates.includes(newBlockedDate)) return;
    setConfig((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates, newBlockedDate].sort(),
    }));
    setNewBlockedDate("");
  }

  function removeBlockedDate(dateToRemove) {
    setConfig((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== dateToRemove),
    }));
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        Cargando configuración del club…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
          Ajustes del Sistema No-Code
        </span>
        <h2 style={{ fontSize: 24, margin: "4px 0", color: "var(--color-ink)" }}>
          Configuración General del Club
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
          Modificá precios de turnos, datos bancarios de seña y días de cierre sin tocar código.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            background: "rgba(37, 211, 102, 0.12)",
            border: "1px solid rgba(37, 211, 102, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#16a34a",
            fontWeight: 600,
          }}
        >
          <span>✓</span> ¡Configuración guardada y sincronizada con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* PRECIOS DE CANCHA */}
        <div
          style={{
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-hairline-strong)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 22px",
          }}
        >
          <h3 style={{ fontSize: 16, margin: "0 0 16px", color: "var(--color-ink)" }}>
            🎾 Precios y Duración de Canchas
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Cancha Completa ($ ARS)
              </label>
              <input
                type="number"
                value={config.fullCourtPrice}
                onChange={(e) => setConfig({ ...config, fullCourtPrice: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 15,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                Total para los 90 minutos de juego
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Por Jugador ($ ARS)
              </label>
              <input
                type="number"
                value={config.perPlayerPrice}
                onChange={(e) => setConfig({ ...config, perPlayerPrice: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 15,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                Monto individual si son 4 jugadores
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Duración del Turno (Minutos)
              </label>
              <input
                type="number"
                value={config.slotDurationMin}
                onChange={(e) => setConfig({ ...config, slotDurationMin: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 15,
                }}
              />
            </div>
          </div>
        </div>

        {/* DATOS BANCARIOS Y COBRO */}
        <div
          style={{
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-hairline-strong)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 22px",
          }}
        >
          <h3 style={{ fontSize: 16, margin: "0 0 16px", color: "var(--color-ink)" }}>
            💳 Datos Bancarios para Seña y Transferencias
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Alias (Mercado Pago / Banco)
              </label>
              <input
                type="text"
                value={config.paymentAlias}
                onChange={(e) => setConfig({ ...config, paymentAlias: e.target.value })}
                placeholder="ej. muzzaga.padel.mp"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                CBU / CVU
              </label>
              <input
                type="text"
                value={config.paymentCbu}
                onChange={(e) => setConfig({ ...config, paymentCbu: e.target.value })}
                placeholder="22 dígitos"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 14,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Titular de la Cuenta
              </label>
              <input
                type="text"
                value={config.paymentTitular}
                onChange={(e) => setConfig({ ...config, paymentTitular: e.target.value })}
                placeholder="ej. Muzzaga Pádel SRL"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Teléfono WhatsApp Oficial
              </label>
              <input
                type="tel"
                value={config.clubPhone}
                onChange={(e) => setConfig({ ...config, clubPhone: e.target.value })}
                placeholder="5492995974176"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-hairline-strong)",
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        </div>

        {/* DÍAS BLOQUEADOS EXCEPCIONALES */}
        <div
          style={{
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-hairline-strong)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 22px",
          }}
        >
          <h3 style={{ fontSize: 16, margin: "0 0 16px", color: "var(--color-ink)" }}>
            🗓️ Días de Cierre Extraordinario (Mantenimiento / Feriados)
          </h3>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-hairline-strong)",
                fontSize: 13,
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addBlockedDate}
              style={{ height: 38, fontSize: 13 }}
            >
              + Bloquear Día
            </button>
          </div>

          {config.blockedDates.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              No hay días excepcionales bloqueados. El club abre habitualmente de Lunes a Sábados.
            </p>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {config.blockedDates.map((d) => (
                <span
                  key={d}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "var(--radius-pill)",
                    padding: "4px 12px",
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {d}
                  <button
                    type="button"
                    onClick={() => removeBlockedDate(d)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: 0,
                    }}
                    title="Desbloquear día"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BOTÓN DE GUARDAR */}
        <button
          type="submit"
          className="btn btn-linear-primary"
          disabled={saving}
          style={{ height: 46, fontSize: 15, justifyContent: "center" }}
        >
          {saving ? "Guardando cambios…" : "💾 Guardar Configuración del Club"}
        </button>
      </form>
    </div>
  );
}
