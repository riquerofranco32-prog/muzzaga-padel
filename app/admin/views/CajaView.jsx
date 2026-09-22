"use client";

import { useEffect, useState } from "react";
import {
  adminAddCashExpense,
  adminCloseDailyCash,
  adminGetDailyCashSummary,
} from "../actions";
import { toISODate } from "../../../lib/booking";
import { CLUB_INFO } from "../../../data/club";

export default function CajaView({ onExpiredSession }) {
  const [date, setDate] = useState(toISODate(new Date()));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Formulario de egreso
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  // Arqueo / Cierre
  const [actualCashInput, setActualCashInput] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [date]);

  async function loadSummary() {
    setLoading(true);
    const res = await adminGetDailyCashSummary(date);
    setLoading(false);
    if (res.ok) {
      setSummary(res.summary);
      if (res.summary.actualCash != null) {
        setActualCashInput(String(res.summary.actualCash));
      } else {
        setActualCashInput("");
      }
    } else if (onExpiredSession) {
      onExpiredSession(res);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setAddingExpense(true);
    const res = await adminAddCashExpense({
      date,
      concept,
      amount,
      notes: expenseNotes,
    });
    setAddingExpense(false);
    if (res.ok) {
      setConcept("");
      setAmount("");
      setExpenseNotes("");
      loadSummary();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo registrar el egreso.");
    }
  }

  async function handleCloseCash(e) {
    e.preventDefault();
    if (!actualCashInput) {
      alert("Ingresá el monto de efectivo real contado en el cajón.");
      return;
    }
    setClosing(true);
    const res = await adminCloseDailyCash({
      date,
      actualCash: actualCashInput,
      notes: closingNotes,
    });
    setClosing(false);
    if (res.ok) {
      loadSummary();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo cerrar la caja.");
    }
  }

  function handleShareCloseWhatsApp() {
    if (!summary) return;
    const diff =
      summary.difference > 0
        ? `+$${summary.difference.toLocaleString("es-AR")} (Sobrante)`
        : summary.difference < 0
        ? `-$${Math.abs(summary.difference).toLocaleString("es-AR")} (Faltante)`
        : "$0 (Exacto)";

    let text = `📊 *CIERRE DE CAJA MUZZAGA PÁDEL*\n`;
    text += `📅 Fecha: ${date}\n\n`;
    text += `💰 *INGRESOS EN EFECTIVO*\n`;
    text += `• Turnos: $${summary.cashTurnos.toLocaleString("es-AR")}\n`;
    text += `• Cantina: $${summary.cashCantina.toLocaleString("es-AR")}\n`;
    text += `• Total Egresos Caja: -$${summary.totalExpenses.toLocaleString("es-AR")}\n`;
    text += `👉 *Efectivo esperado en cajón: $${summary.expectedCash.toLocaleString("es-AR")}*\n`;
    text += `👉 *Efectivo real contado: $${(summary.actualCash || 0).toLocaleString("es-AR")}*\n`;
    text += `⚖️ *Diferencia:* ${diff}\n\n`;
    text += `🏦 *TRANSFERENCIAS / MERCADO PAGO*\n`;
    text += `• Transferencias directas: $${(summary.transferTurnos + summary.transferCantina).toLocaleString("es-AR")}\n`;
    text += `• Mercado Pago acreditado: $${(summary.mpTurnos + summary.mpCantina).toLocaleString("es-AR")}\n\n`;
    if (summary.notes) {
      text += `📝 Observaciones: ${summary.notes}\n\n`;
    }
    text += `Cierre sellado en sistema Muzzaga.`;

    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  const expectedCash = summary?.expectedCash || 0;
  const counted = Number(actualCashInput) || 0;
  const liveDiff = actualCashInput ? counted - expectedCash : null;

  return (
    <div>
      {/* HEADER DE CAJA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <span className="badge-linear badge-emerald" style={{ marginBottom: 6 }}>
            Arqueo &amp; Control Financiero
          </span>
          <h2 style={{ fontSize: 22, margin: "4px 0", color: "var(--color-ink)" }}>
            Caja Diaria y Cierre Z
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
            onClick={loadSummary}
            style={{ height: 38, fontSize: 13 }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Calculando balance de caja…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* BANNER DE CAJA CERRADA */}
          {summary?.closed && (
            <div
              style={{
                background: "rgba(37, 211, 102, 0.12)",
                border: "1px solid rgba(37, 211, 102, 0.4)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>🔒</span>
                <div>
                  <strong style={{ fontSize: 16, color: "#16a34a", display: "block" }}>
                    Caja Cerrada y Sellada
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Cierre realizado el{" "}
                    {new Date(summary.closedAt).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    hs. Diferencia registrada:{" "}
                    {summary.difference >= 0 ? `+$${summary.difference}` : `-$${Math.abs(summary.difference)}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-whatsapp"
                onClick={handleShareCloseWhatsApp}
                style={{ gap: 6, height: 38, fontSize: 13 }}
              >
                Enviar reporte por WhatsApp →
              </button>
            </div>
          )}

          {/* TARJETAS KPI DE CAJA */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
              gap: 14,
            }}
          >
            {/* EFECTIVO ESPERADO */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                💵 Efectivo en Cajón (Esperado)
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#16a34a",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                ${summary.expectedCash.toLocaleString("es-AR")}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                Turnos: ${summary.cashTurnos.toLocaleString("es-AR")} · Cantina: ${summary.cashCantina.toLocaleString("es-AR")}
              </div>
            </div>

            {/* TRANSFERENCIAS */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                🏦 Transferencias Directas
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                ${(summary.transferTurnos + summary.transferCantina).toLocaleString("es-AR")}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                Cobrado en cuenta banco/alias
              </div>
            </div>

            {/* MERCADO PAGO */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                💳 Mercado Pago (Online)
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#009ee3",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                ${(summary.mpTurnos + summary.mpCantina).toLocaleString("es-AR")}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                Señas y pagos acreditados
              </div>
            </div>

            {/* EGRESOS REGISTRADOS */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                📉 Egresos de Caja Física
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#dc2626",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                -${summary.totalExpenses.toLocaleString("es-AR")}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                {summary.expensesList.length} salidas de dinero
              </div>
            </div>
          </div>

          {/* GRID: REGISTRO DE EGRESOS & ARQUEO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* MÓDULO DE EGRESOS */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
              }}
            >
              <h3 style={{ fontSize: 16, margin: "0 0 14px", color: "var(--color-ink)" }}>
                💸 Registrar Salida de Dinero (Egreso)
              </h3>

              <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Concepto del gasto:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Hielo cantina, carbón, artículos limpieza"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-hairline-strong)",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Monto en efectivo ($):
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="ej. 3500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-hairline-strong)",
                        fontSize: 13,
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Nota / Comprobante:
                    </label>
                    <input
                      type="text"
                      placeholder="Opcional"
                      value={expenseNotes}
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-hairline-strong)",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={addingExpense}
                  style={{ height: 38, fontSize: 13, justifyContent: "center" }}
                >
                  {addingExpense ? "Registrando…" : "+ Cargar Egreso"}
                </button>
              </form>

              {/* LISTA DE EGRESOS */}
              <div style={{ marginTop: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Egresos de hoy:
                </span>
                {summary.expensesList.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "8px 0" }}>
                    No hay egresos registrados en esta fecha.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {summary.expensesList.map((exp) => (
                      <div
                        key={exp.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          background: "var(--color-surface-subtle)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12.5,
                        }}
                      >
                        <div>
                          <strong>{exp.concept}</strong>
                          {exp.notes && (
                            <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                              ({exp.notes})
                            </span>
                          )}
                        </div>
                        <span style={{ color: "#dc2626", fontWeight: 700, fontFamily: "var(--font-jetbrains-mono)" }}>
                          -${exp.amount.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MÓDULO DE ARQUEO Y CIERRE Z */}
            <div
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
              }}
            >
              <h3 style={{ fontSize: 16, margin: "0 0 14px", color: "var(--color-ink)" }}>
                ⚖️ Arqueo de Efectivo &amp; Cierre de Jornada
              </h3>

              <form onSubmit={handleCloseCash} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Efectivo real contado en cajón ($):
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contá los billetes y poné el total"
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-hairline-strong)",
                      fontSize: 16,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                    }}
                  />
                </div>

                {liveDiff != null && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background:
                        liveDiff === 0
                          ? "rgba(37, 211, 102, 0.1)"
                          : liveDiff > 0
                          ? "rgba(56, 189, 248, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      border: `1px solid ${
                        liveDiff === 0
                          ? "rgba(37, 211, 102, 0.3)"
                          : liveDiff > 0
                          ? "rgba(56, 189, 248, 0.3)"
                          : "rgba(239, 68, 68, 0.3)"
                      }`,
                      fontSize: 13,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Diferencia de Caja:</span>
                    <strong
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        color:
                          liveDiff === 0
                            ? "#16a34a"
                            : liveDiff > 0
                            ? "#0284c7"
                            : "#dc2626",
                      }}
                    >
                      {liveDiff === 0
                        ? "Exacto ($0)"
                        : liveDiff > 0
                        ? `Sobrante: +$${liveDiff.toLocaleString("es-AR")}`
                        : `Faltante: -$${Math.abs(liveDiff).toLocaleString("es-AR")}`}
                    </strong>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Observaciones del cierre:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ej. Se dejaron $10.000 de cambio para el turno de la tarde"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-hairline-strong)",
                      fontSize: 13,
                      resize: "none",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-linear-primary"
                  disabled={closing}
                  style={{ height: 44, fontSize: 14, justifyContent: "center" }}
                >
                  {closing
                    ? "Cerrando jornada…"
                    : summary.closed
                    ? "Actualizar Cierre de Caja"
                    : "🔒 Cerrar Caja del Día"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
