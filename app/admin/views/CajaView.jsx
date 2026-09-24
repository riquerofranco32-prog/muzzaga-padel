"use client";

import { useEffect, useState } from "react";
import { Coins, Download, Lock, Receipt, Scale, Send, Trash2, X } from "lucide-react";
import { EmptyState, SkeletonCards, SkeletonRows } from "../ui/states";
import StaffPinModal from "../ui/StaffPinModal";
import { formatARS, formatDate, formatTime, plural } from "../../../lib/format";
import { cashDiffTone } from "../../../lib/metrics";
import {
  adminAddCashExpense,
  adminCloseDailyCash,
  adminDeleteCashExpense,
  adminGetCashHistory,
  adminGetDailyCashSummary,
} from "../actions";
import { todayInClub, isoAddDays } from "../../../lib/booking";
import { CLUB_INFO } from "../../../data/club";

const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true };
const BILL_DENOMINATIONS = [20000, 10000, 2000, 1000, 500, 200, 100];
const CATEGORIES = [
  { id: "hielo", label: "Hielo" },
  { id: "limpieza", label: "Limpieza" },
  { id: "mantenimiento", label: "Mantenimiento" },
  { id: "otros", label: "Otros" },
];
const categoryLabel = (id) =>
  CATEGORIES.find((c) => c.id === id)?.label || "Otros";
const DIFF_TEXT = {
  ok: "Cuadra exacto",
  minor: "Diferencia chica",
  major: "Diferencia grande: revisá antes de cerrar",
};
const CLOSED_BY_KEY = "muzzaga_admin_closed_by";

function diffLabel(diff) {
  if (!diff) return "$0";
  return `${formatARS(diff, { signed: true })} ${diff > 0 ? "sobrante" : "faltante"}`;
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((r) =>
      r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CajaView({ initialDate, onExpiredSession, onToast }) {
  const [date, setDate] = useState(() => initialDate || todayInClub());
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [expense, setExpense] = useState({
    category: "hielo",
    concept: "",
    amount: "",
    notes: "",
  });
  const [addingExpense, setAddingExpense] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const [counted, setCounted] = useState("");
  const [showBillCalc, setShowBillCalc] = useState(false);
  const [billCounts, setBillCounts] = useState({
    20000: "",
    10000: "",
    2000: "",
    1000: "",
    500: "",
    200: "",
    100: "",
  });
  const [closingNotes, setClosingNotes] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [closedBy, setClosedBy] = useState("");
  const [closing, setClosing] = useState(false);

  function handleBillChange(denom, val) {
    const nextCounts = { ...billCounts, [denom]: val };
    setBillCounts(nextCounts);
    const total = BILL_DENOMINATIONS.reduce((sum, d) => {
      const qty = parseInt(nextCounts[d], 10) || 0;
      return sum + d * qty;
    }, 0);
    setCounted(total > 0 ? String(total) : "");
  }

  useEffect(() => {
    loadSummary();
  }, [date]);

  useEffect(() => {
    loadHistory();
    try {
      setClosedBy(localStorage.getItem(CLOSED_BY_KEY) || "");
    } catch {
      // Almacenamiento bloqueado: se tipea cada vez.
    }
  }, []);

  async function loadSummary() {
    setLoading(true);
    setLoadError("");
    const res = await adminGetDailyCashSummary(date);
    setLoading(false);
    if (res.ok) {
      setSummary(res.summary);
      setCounted(
        res.summary.actualCash != null ? String(res.summary.actualCash) : "",
      );
    } else if (!onExpiredSession?.(res)) {
      setSummary(null);
      setLoadError(res.error || "No se pudo calcular la caja del día.");
    }
  }

  async function loadHistory() {
    const res = await adminGetCashHistory(30);
    if (res.ok) setHistory(res.sessions);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setAddingExpense(true);
    const concept = expense.concept.trim() || categoryLabel(expense.category);
    const res = await adminAddCashExpense({ date, ...expense, concept });
    setAddingExpense(false);
    if (res.ok) {
      onToast?.(
        `Egreso cargado · ${concept} · ${formatARS(-Number(expense.amount))}`,
      );
      setExpense((x) => ({ ...x, concept: "", amount: "", notes: "" }));
      loadSummary();
    } else if (!onExpiredSession?.(res)) {
      onToast?.(res.error || "No se pudo registrar el egreso.", {
        tone: "error",
      });
    }
  }

  async function handleClose() {
    setClosing(true);
    const res = await adminCloseDailyCash({
      date,
      actualCash: counted,
      notes: closingNotes,
      closedBy,
    });
    setClosing(false);
    if (res.ok) {
      try {
        localStorage.setItem(CLOSED_BY_KEY, closedBy.trim());
      } catch {
        // sin persistencia local, no pasa nada
      }
      setIsConfirmOpen(false);
      onToast?.(`Caja cerrada · ${diffLabel(res.difference)}`);
      loadSummary();
      loadHistory();
    } else if (!onExpiredSession?.(res)) {
      onToast?.(res.error || "No se pudo cerrar la caja.", { tone: "error" });
    }
  }

  function shareWhatsApp() {
    if (!summary) return;
    const lines = [
      `📊 *CIERRE DE CAJA MUZZAGA PÁDEL*`,
      `📅 ${formatDate(date, "long")}`,
      "",
      `💰 *EFECTIVO*`,
      `• Turnos: ${formatARS(summary.cashTurnos)}`,
      `• Cantina: ${formatARS(summary.cashCantina)}`,
      `• Egresos: ${formatARS(-summary.totalExpenses)}`,
      `👉 *Esperado en cajón: ${formatARS(summary.expectedCash)}*`,
      `👉 *Contado: ${formatARS(summary.actualCash || 0)}*`,
      `⚖️ *Diferencia:* ${diffLabel(summary.difference ?? 0)}`,
      "",
      `🏦 Transferencias: ${formatARS(summary.transferTurnos + summary.transferCantina)}`,
      `💳 Mercado Pago: ${formatARS(summary.mpTurnos + summary.mpCantina)}`,
      summary.notes ? `\n📝 ${summary.notes}` : "",
      summary.closedBy
        ? `\nCerró: ${summary.closedBy} a las ${formatTime(summary.closedAt)}`
        : "",
    ];
    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener",
    );
  }

  function exportHistory() {
    downloadCsv(`muzzaga-cierres-${todayInClub()}.csv`, [
      ["Fecha", "Esperado", "Contado", "Diferencia", "Cerró", "Hora", "Notas"],
      ...(history || []).map((h) => [
        h.date,
        h.expectedCash,
        h.actualCash,
        h.difference,
        h.closedBy || "",
        h.closedAt ? formatTime(h.closedAt) : "",
        h.notes || "",
      ]),
    ]);
  }

  const header = (
    <div className="admin-view-toolbar">
      <h2 className="admin-section-title" style={{ margin: 0 }}>
        Arqueo del {formatDate(date, "long")}
      </h2>
      <div className="admin-view-toolbar-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDate(isoAddDays(todayInClub(), -1))}
          style={{ height: 32, fontSize: 12, padding: "0 10px" }}
        >
          Ayer
        </button>
        <button
          type="button"
          className={`btn ${date === todayInClub() ? "btn-linear-primary" : "btn-secondary"}`}
          onClick={() => setDate(todayInClub())}
          style={{ height: 32, fontSize: 12, padding: "0 10px" }}
        >
          Hoy
        </button>
        <input
          type="date"
          aria-label="Fecha de la caja"
          value={date}
          max={todayInClub()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          style={{ height: 32, fontSize: 12 }}
        />
      </div>
    </div>
  );

  if (!summary) {
    return (
      <div>
        {header}
        {loadError ? (
          <div
            role="alert"
            className="admin-settings-card"
            style={{ color: "#b91c1c" }}
          >
            {loadError}
          </div>
        ) : (
          <SkeletonCards count={4} />
        )}
      </div>
    );
  }

  const isClosed = summary.closed;
  const liveDiff =
    counted === "" ? null : Number(counted) - summary.expectedCash;
  const tone = liveDiff == null ? null : cashDiffTone(liveDiff);

  return (
    <div className={loading ? "admin-content-loading" : ""}>
      {header}

      {isClosed && (
        <div className="admin-closed-banner" role="status">
          <Lock {...ICON} />
          <div>
            <strong>
              Cerrado{summary.closedBy ? ` por ${summary.closedBy}` : ""} a las{" "}
              {formatTime(summary.closedAt)}
            </strong>
            <span>
              Contado {formatARS(summary.actualCash || 0)} ·{" "}
              {diffLabel(summary.difference ?? 0)}. El día queda en solo
              lectura.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={shareWhatsApp}
          >
            <Send {...ICON} /> Enviar por WhatsApp
          </button>
        </div>
      )}

      {/* 4 KPI Cards de Caja Estilo Kravio */}
      <div className="admin-kpis-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", marginBottom: 20 }}>
        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Efectivo Turnos</span>
            <Coins size={17} style={{ color: "#15803d" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#15803d" }}>
                {formatARS(summary.cashTurnos)}
              </div>
              <span className="admin-cell-sub">Cobrado en mano por turnos</span>
            </div>
          </div>
        </div>

        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Efectivo Cantina</span>
            <Receipt size={17} style={{ color: "#ea580c" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#ea580c" }}>
                {formatARS(summary.cashCantina)}
              </div>
              <span className="admin-cell-sub">Ventas tercer tiempo</span>
            </div>
          </div>
        </div>

        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Egresos / Gastos</span>
            <Receipt size={17} style={{ color: summary.totalExpenses > 0 ? "#dc2626" : "#6b7280" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: summary.totalExpenses > 0 ? "#dc2626" : "#111827" }}>
                {formatARS(-summary.totalExpenses)}
              </div>
              <span className="admin-cell-sub">Hielo, limpieza y mantenimiento</span>
            </div>
          </div>
        </div>

        <div className="admin-kravio-kpi-card" style={{ background: "#111827", borderColor: "#1f2937", color: "#ffffff" }}>
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title" style={{ color: "#9ca3af" }}>Esperado en Cajón</span>
            <Scale size={17} style={{ color: "#f97316" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#ffffff" }}>
                {formatARS(summary.expectedCash)}
              </div>
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>Efectivo físico a controlar</span>
            </div>
          </div>
        </div>
      </div>
      <p className="admin-field-hint" style={{ margin: "8px 0 20px" }}>
        Fuera del cajón: Transferencias{" "}
        {formatARS(summary.transferTurnos + summary.transferCantina)} · Mercado
        Pago {formatARS(summary.mpTurnos + summary.mpCantina)}
      </p>

      <div className="admin-cash-grid">
        {/* EGRESOS */}
        <section className="admin-settings-card">
          <h3 className="admin-section-title">
            <Receipt {...ICON} /> Egresos del día
          </h3>

          {!isClosed && (
            <form onSubmit={handleAddExpense} className="admin-expense-form">
              <div
                className="admin-segmented"
                role="group"
                aria-label="Categoría del egreso"
              >
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={expense.category === c.id}
                    onClick={() =>
                      setExpense((x) => ({ ...x, category: c.id }))
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label className="admin-field-label" htmlFor="exp-concept">
                    Detalle
                  </label>
                  <input
                    id="exp-concept"
                    type="text"
                    placeholder={`ej. ${categoryLabel(expense.category)} para la cantina`}
                    value={expense.concept}
                    onChange={(e) =>
                      setExpense((x) => ({ ...x, concept: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-field-label" htmlFor="exp-amount">
                    Monto ($)
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    required
                    value={expense.amount}
                    onChange={(e) =>
                      setExpense((x) => ({ ...x, amount: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={addingExpense || !expense.amount}
              >
                {addingExpense ? "Cargando…" : "Cargar egreso"}
              </button>
            </form>
          )}

          {summary.expensesList.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sin egresos este día"
              text={
                isClosed
                  ? "No se registraron salidas de dinero."
                  : "Cargá lo que sale del cajón (hielo, limpieza, cambio) para que el arqueo cuadre."
              }
            />
          ) : (
            <ul className="admin-expense-list">
              {summary.expensesList.map((x) => (
                <li key={x.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <span className="admin-tag">{categoryLabel(x.category)}</span>
                    <span className="admin-expense-concept" style={{ flex: 1, minWidth: 0 }}>
                      {x.concept}
                      {x.notes && <small> · {x.notes}</small>}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong className="is-negative">
                      {formatARS(-x.amount)}
                    </strong>
                    {!isClosed && (
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ color: "#9ca3af", padding: 4, cursor: "pointer", background: "none", border: "none" }}
                        title="Eliminar egreso (requiere PIN)"
                        aria-label={`Eliminar egreso ${x.concept}`}
                        onClick={() => setDeletingExpense(x)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ARQUEO */}
        <section className="admin-settings-card">
          <h3 className="admin-section-title">
            <Scale {...ICON} /> Arqueo y cierre
          </h3>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="cash-counted">
              Efectivo contado en el cajón ($)
            </label>
            <input
              id="cash-counted"
              type="number"
              inputMode="numeric"
              min={0}
              className="admin-input-lg"
              placeholder="Contá los billetes y poné el total"
              value={counted}
              readOnly={isClosed}
              onChange={(e) => setCounted(e.target.value)}
            />
            {!isClosed && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    height: 28,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => setShowBillCalc((v) => !v)}
                >
                  <Coins size={14} />
                  <span>
                    {showBillCalc ? "Ocultar desglose" : "Contar por billetes ($20k, $10k, $2k...)"}
                  </span>
                </button>

                {showBillCalc && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: "rgba(0, 0, 0, 0.03)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {BILL_DENOMINATIONS.map((denom) => (
                      <div key={denom} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                          ${denom >= 1000 ? `${denom / 1000}k` : denom} ({formatARS(denom)})
                        </span>
                        <input
                          type="number"
                          min={0}
                          placeholder="Cant."
                          value={billCounts[denom]}
                          onChange={(e) => handleBillChange(denom, e.target.value)}
                          style={{
                            height: 28,
                            fontSize: 12,
                            padding: "2px 8px",
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "#fff",
                          }}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: 11,
                          color: "#dc2626",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          setBillCounts({
                            20000: "",
                            10000: "",
                            2000: "",
                            1000: "",
                            500: "",
                            200: "",
                            100: "",
                          });
                          setCounted("");
                        }}
                      >
                        Limpiar contador
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {liveDiff != null && (
            <div
              className="admin-cash-diff"
              data-tone={tone}
              role="status"
              aria-live="polite"
            >
              <span>{DIFF_TEXT[tone]}</span>
              <strong>{diffLabel(liveDiff)}</strong>
            </div>
          )}

          {!isClosed && (
            <>
              <div className="admin-field">
                <label className="admin-field-label" htmlFor="cash-notes">
                  Observaciones
                </label>
                <textarea
                  id="cash-notes"
                  rows={2}
                  placeholder="ej. Quedaron $10.000 de cambio para mañana"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-linear-primary admin-btn-block"
                disabled={counted === ""}
                onClick={() => setIsConfirmOpen(true)}
              >
                <Lock {...ICON} /> Cerrar caja del día
              </button>
            </>
          )}
        </section>
      </div>

      {/* HISTORIAL */}
      <section style={{ marginTop: 28 }}>
        <div className="admin-view-toolbar">
          <h2 className="admin-section-title" style={{ margin: 0 }}>
            Cierres anteriores
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportHistory}
            disabled={!history?.length}
          >
            <Download {...ICON} /> Exportar CSV
          </button>
        </div>
        {!history ? (
          <SkeletonRows count={4} />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Esperado</th>
                  <th>Contado</th>
                  <th>Diferencia</th>
                  <th>Cerró</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <EmptyState
                        icon={Lock}
                        title="Todavía no hay cierres"
                        text="Cada vez que cierres la caja del día queda registrada acá."
                      />
                    </td>
                  </tr>
                ) : (
                  history.map((h) => {
                    const t = cashDiffTone(h.difference);
                    return (
                      <tr key={h.date}>
                        <td data-label="Fecha">
                          <button
                            type="button"
                            className="admin-link-btn"
                            onClick={() => setDate(h.date)}
                          >
                            {formatDate(h.date, "long")}
                          </button>
                        </td>
                        <td data-label="Esperado">
                          {formatARS(h.expectedCash)}
                        </td>
                        <td data-label="Contado">{formatARS(h.actualCash)}</td>
                        <td data-label="Diferencia">
                          <span className="admin-diff-pill" data-tone={t}>
                            {diffLabel(h.difference)}
                          </span>
                        </td>
                        <td data-label="Cerró">
                          {h.closedBy || "—"}
                          {h.closedAt && (
                            <span className="admin-cell-sub">
                              {" "}
                              {formatTime(h.closedAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isConfirmOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !closing && setIsConfirmOpen(false)}
        >
          <div
            className="admin-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-cash-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-head">
              <h3 id="close-cash-title">
                Cerrar caja del {formatDate(date, "long")}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsConfirmOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <dl className="admin-summary-list">
              <div>
                <dt>Esperado en cajón</dt>
                <dd>{formatARS(summary.expectedCash)}</dd>
              </div>
              <div>
                <dt>Contado</dt>
                <dd>{formatARS(Number(counted))}</dd>
              </div>
              <div>
                <dt>Diferencia</dt>
                <dd>
                  <span className="admin-diff-pill" data-tone={tone}>
                    {diffLabel(liveDiff)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Egresos</dt>
                <dd>
                  {plural(summary.expensesList.length, "egreso", "egresos")} ·{" "}
                  {formatARS(-summary.totalExpenses)}
                </dd>
              </div>
            </dl>
            <div className="admin-field">
              <label className="admin-field-label" htmlFor="closed-by">
                ¿Quién cierra?
              </label>
              <input
                id="closed-by"
                type="text"
                maxLength={40}
                placeholder="Tu nombre"
                value={closedBy}
                onChange={(e) => setClosedBy(e.target.value)}
                autoFocus
              />
            </div>
            <p className="admin-field-hint">
              Una vez cerrada, la caja de este día queda en solo lectura.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsConfirmOpen(false)}
                disabled={closing}
              >
                Volver
              </button>
              <button
                type="button"
                className="btn btn-linear-primary"
                onClick={handleClose}
                disabled={closing || !closedBy.trim()}
              >
                {closing ? "Cerrando…" : "Confirmar cierre"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingExpense && (
        <StaffPinModal
          isOpen={Boolean(deletingExpense)}
          onClose={() => setDeletingExpense(null)}
          title="Eliminar egreso de caja"
          description={`¿Seguro que querés eliminar el egreso "${deletingExpense.concept}" por ${formatARS(-deletingExpense.amount)}?`}
          actionLabel="Eliminar egreso"
          confirmTone="danger"
          requireReason={false}
          onConfirm={async ({ pin, staff, reason }) => {
            const res = await adminDeleteCashExpense({
              date,
              expenseId: deletingExpense.id,
              pin,
              reason,
            });
            if (res.ok) {
              onToast?.(`Egreso eliminado por ${staff.name}`);
              setDeletingExpense(null);
              loadSummary();
            } else {
              throw new Error(res.error || "No se pudo eliminar el egreso");
            }
          }}
        />
      )}
    </div>
  );
}
