"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  Receipt,
  Scale,
} from "lucide-react";
import { EmptyState, SkeletonCards } from "../ui/states";
import { formatARS, formatTime, plural } from "../../../lib/format";
import {
  adminAddCashExpense,
  adminCloseDailyCash,
  adminGetDailyCashSummary,
} from "../actions";
import { todayInClub } from "../../../lib/booking";
import { CLUB_INFO } from "../../../data/club";

const LABEL_ICON = { size: 14, strokeWidth: 1.75, "aria-hidden": true };
const TITLE_ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true };

export default function CajaView({ initialDate, onExpiredSession, onToast }) {
  const [date, setDate] = useState(() => initialDate || todayInClub());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
    setLoadError("");
    const res = await adminGetDailyCashSummary(date);
    setLoading(false);
    if (res.ok) {
      setSummary(res.summary);
      if (res.summary.actualCash != null) {
        setActualCashInput(String(res.summary.actualCash));
      } else {
        setActualCashInput("");
      }
    } else if (!onExpiredSession?.(res)) {
      setSummary(null);
      setLoadError(res.error || "No se pudo calcular la caja del día.");
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
      onToast?.(`Egreso cargado · ${concept.trim()} · ${formatARS(-Number(amount))}`);
      setConcept("");
      setAmount("");
      setExpenseNotes("");
      loadSummary();
    } else if (!onExpiredSession?.(res)) {
      onToast?.(res.error || "No se pudo registrar el egreso.", { tone: "error" });
    }
  }

  async function handleCloseCash(e) {
    e.preventDefault();
    if (!actualCashInput) {
      onToast?.("Ingresá el efectivo que contaste en el cajón.", { tone: "error" });
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
      onToast?.(
        res.difference
          ? `Caja cerrada · diferencia ${formatARS(res.difference, { signed: true })}`
          : "Caja cerrada · cuadra exacto",
      );
      loadSummary();
    } else if (!onExpiredSession?.(res)) {
      onToast?.(res.error || "No se pudo cerrar la caja.", { tone: "error" });
    }
  }

  function handleShareCloseWhatsApp() {
    if (!summary) return;
    const difference = summary.difference ?? 0;
    const diff =
      difference > 0
        ? `${formatARS(difference, { signed: true })} (Sobrante)`
        : difference < 0
          ? `${formatARS(difference)} (Faltante)`
          : "$0 (Exacto)";

    let text = `📊 *CIERRE DE CAJA MUZZAGA PÁDEL*\n`;
    text += `📅 Fecha: ${date}\n\n`;
    text += `💰 *INGRESOS EN EFECTIVO*\n`;
    text += `• Turnos: ${formatARS(summary.cashTurnos)}\n`;
    text += `• Cantina: ${formatARS(summary.cashCantina)}\n`;
    text += `• Total Egresos Caja: ${formatARS(-summary.totalExpenses)}\n`;
    text += `👉 *Efectivo esperado en cajón: ${formatARS(summary.expectedCash)}*\n`;
    text += `👉 *Efectivo real contado: ${formatARS(summary.actualCash || 0)}*\n`;
    text += `⚖️ *Diferencia:* ${diff}\n\n`;
    text += `🏦 *TRANSFERENCIAS / MERCADO PAGO*\n`;
    text += `• Transferencias directas: ${formatARS(summary.transferTurnos + summary.transferCantina)}\n`;
    text += `• Mercado Pago acreditado: ${formatARS(summary.mpTurnos + summary.mpCantina)}\n\n`;
    if (summary.notes) {
      text += `📝 Observaciones: ${summary.notes}\n\n`;
    }
    text += `Cierre sellado en sistema Muzzaga.`;

    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(text)}`,
      "_blank",
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
        <h2 className="admin-section-title" style={{ margin: 0 }}>
          Arqueo del día
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            aria-label="Fecha de la caja"
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

      {!summary ? (
        loadError ? (
          <div role="alert" style={{ padding: 24, color: "#b91c1c" }}>
            {loadError}
          </div>
        ) : (
          <SkeletonCards count={4} />
        )
      ) : (
        <div
          className={loading ? "admin-content-loading" : ""}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
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
                <Lock size={24} strokeWidth={1.75} aria-hidden color="var(--success)" />
                <div>
                  <strong
                    style={{ fontSize: 16, color: "var(--success)", display: "block" }}
                  >
                    Caja Cerrada y Sellada
                  </strong>
                  <span
                    style={{ fontSize: 12, color: "var(--text-secondary)" }}
                  >
                    Cierre realizado a las {formatTime(summary.closedAt)}.
                    Diferencia registrada:{" "}
                    {summary.difference
                      ? formatARS(summary.difference, { signed: true })
                      : "$0 (exacto)"}
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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
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
              <span
                className="admin-kpi-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Banknote {...LABEL_ICON} /> Efectivo en cajón (esperado)
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--success)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                {formatARS(summary.expectedCash)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
                Turnos: {formatARS(summary.cashTurnos)} · Cantina:{" "}
                {formatARS(summary.cashCantina)}
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
              <span
                className="admin-kpi-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Landmark {...LABEL_ICON} /> Transferencias
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
                {formatARS(summary.transferTurnos + summary.transferCantina)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
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
              <span
                className="admin-kpi-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <CreditCard {...LABEL_ICON} /> Mercado Pago
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--info)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                {formatARS(summary.mpTurnos + summary.mpCantina)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
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
              <span
                className="admin-kpi-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <ArrowDownRight {...LABEL_ICON} /> Egresos de caja
              </span>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: summary.totalExpenses > 0 ? "var(--danger)" : "var(--text)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  marginTop: 6,
                }}
              >
                {formatARS(-summary.totalExpenses)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
                {plural(
                  summary.expensesList.length,
                  "salida de dinero",
                  "salidas de dinero",
                )}
              </div>
            </div>
          </div>

          {/* GRID: REGISTRO DE EGRESOS & ARQUEO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
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
              <h3 className="admin-section-title" style={{ margin: "0 0 14px" }}>
                <Receipt {...TITLE_ICON} /> Registrar egreso
              </h3>

              <form
                onSubmit={handleAddExpense}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
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
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
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
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  Egresos de hoy:
                </span>
                {summary.expensesList.length === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="Sin egresos este día"
                    text="Cargá acá lo que sale del cajón (hielo, limpieza, cambio) para que el arqueo cuadre."
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
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
                            <span
                              style={{
                                color: "var(--text-muted)",
                                marginLeft: 6,
                              }}
                            >
                              ({exp.notes})
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            color: "#dc2626",
                            fontWeight: 700,
                            fontFamily: "var(--font-jetbrains-mono)",
                          }}
                        >
                          {formatARS(-exp.amount)}
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
              <h3 className="admin-section-title" style={{ margin: "0 0 14px" }}>
                <Scale {...TITLE_ICON} /> Arqueo y cierre de jornada
              </h3>

              <form
                onSubmit={handleCloseCash}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
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
                          ? `Sobrante: ${formatARS(liveDiff, { signed: true })}`
                          : `Faltante: ${formatARS(liveDiff)}`}
                    </strong>
                  </div>
                )}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
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
                      : "Cerrar caja del día"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
