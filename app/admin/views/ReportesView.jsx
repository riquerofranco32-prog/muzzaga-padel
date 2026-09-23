"use client";

import { useEffect, useState } from "react";
import { formatARS, formatDate, formatPct, plural } from "../../../lib/format";
import { todayInClub } from "../../../lib/booking";
import { adminGetMonthStats } from "../actions";
import { IconClipboard } from "../adminHelpers";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportesView({ onExpiredSession }) {
  const today = todayInClub();
  const [year, setYear] = useState(Number(today.slice(0, 4)));
  const [month, setMonth] = useState(Number(today.slice(5, 7)));
  const [monthStats, setMonthStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminGetMonthStats(year, month).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setMonthStats(res);
      } else if (onExpiredSession) {
        onExpiredSession(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const totals = monthStats?.totals;
  const topDays = (monthStats?.days || [])
    .filter((d) => d.cobrado > 0 || d.turnos > 0)
    .sort((a, b) => b.cobrado - a.cobrado)
    .slice(0, 5);

  function handleExportCsv() {
    if (!monthStats) return;
    const rows = [
      [
        "Fecha",
        "Turnos",
        "Cobrado turnos",
        "Cantina",
        "Cobrado total",
        "Facturado turnos",
        "Por cobrar",
        "Cupos",
        "Ocupación %",
      ],
      ...monthStats.days.map((d) => [
        d.date,
        d.turnos,
        d.cobradoTurnos,
        d.cantina,
        d.cobrado,
        d.facturadoTurnos,
        d.porCobrar,
        d.totalSlots,
        d.ocupacionPct ?? "",
      ]),
    ];
    downloadCsv(
      `muzzaga-reporte-${year}-${String(month).padStart(2, "0")}.csv`,
      rows,
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>
          Reporte Mensual
        </h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            className="admin-modal-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="admin-modal-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-linear-primary"
            style={{ height: 36, padding: "6px 14px", fontSize: 13 }}
            onClick={handleExportCsv}
            disabled={!monthStats}
          >
            <IconClipboard /> Descargar CSV
          </button>
        </div>
      </div>

      <div className={loading ? "admin-content-loading" : ""}>
        {monthStats && (
          <>
            <div className="admin-report-summary-grid">
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Cobrado del Mes</span>
                <div className="admin-kpi-val" style={{ color: "#047857" }}>
                  {formatARS(totals.cobrado)}
                </div>
                <span className="admin-kpi-sub">
                  Turnos {formatARS(totals.cobradoTurnos)} · Cantina{" "}
                  {formatARS(totals.cantina)}
                </span>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Turnos Jugados</span>
                <div className="admin-kpi-val">
                  {plural(totals.turnos, "turno", "turnos")}
                </div>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Por Cobrar</span>
                <div
                  className="admin-kpi-val"
                  style={{
                    color: totals.porCobrar > 0 ? "#b45309" : "#047857",
                  }}
                >
                  {formatARS(totals.porCobrar)}
                </div>
                <span className="admin-kpi-sub">
                  Facturado turnos {formatARS(totals.facturadoTurnos)}
                </span>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Ocupación Promedio</span>
                <div className="admin-kpi-val">
                  {formatPct(monthStats.ocupacionPct)}
                </div>
                <span className="admin-kpi-sub">Días abiertos hasta hoy</span>
              </div>
            </div>

            {totals.pagadosSinCobro > 0 && (
              <p style={{ fontSize: 13, color: "#b45309", margin: "0 0 16px" }}>
                ⚠️{" "}
                {plural(
                  totals.pagadosSinCobro,
                  "turno marcado pagado no tiene",
                  "turnos marcados pagados no tienen",
                )}{" "}
                cobro cargado: esa plata no aparece como cobrada.
              </p>
            )}

            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-ink)",
                marginBottom: 12,
              }}
            >
              Mejores Días del Mes
            </h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turnos</th>
                    <th>Ocupación</th>
                    <th>Cobrado</th>
                  </tr>
                </thead>
                <tbody>
                  {topDays.length > 0 ? (
                    topDays.map((d) => (
                      <tr key={d.date}>
                        <td>
                          <strong>{formatDate(d.date)}</strong>
                        </td>
                        <td>{d.turnos}</td>
                        <td>{formatPct(d.ocupacionPct)}</td>
                        <td
                          style={{
                            color: "#047857",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                          }}
                        >
                          {formatARS(d.cobrado)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "var(--text-muted)",
                        }}
                      >
                        Sin turnos registrados en este mes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
