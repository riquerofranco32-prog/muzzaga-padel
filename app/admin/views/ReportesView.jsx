"use client";

import { useEffect, useState } from "react";
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
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
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

  const activeDays = monthStats?.days.filter((d) => d.totalSlots > 0) || [];
  const daysWithTurnos = activeDays.filter((d) => d.turnos > 0);
  const promedioDiario =
    daysWithTurnos.length > 0
      ? Math.round(monthStats.totals.ingresos / daysWithTurnos.length)
      : 0;
  const ocupacionPromedio =
    activeDays.length > 0
      ? Math.round(
          (activeDays.reduce((s, d) => s + d.turnos, 0) /
            activeDays.reduce((s, d) => s + d.totalSlots, 0)) *
            100,
        )
      : 0;
  const topDays = [...daysWithTurnos]
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  function handleExportCsv() {
    if (!monthStats) return;
    const rows = [
      ["Fecha", "Turnos", "Recaudación", "Cupos Totales", "Ocupación %"],
      ...monthStats.days.map((d) => [
        d.date,
        d.turnos,
        d.ingresos,
        d.totalSlots,
        d.totalSlots ? Math.round((d.turnos / d.totalSlots) * 100) : 0,
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
                <span className="admin-kpi-label">Recaudación del Mes</span>
                <div className="admin-kpi-val" style={{ color: "#047857" }}>
                  ${monthStats.totals.ingresos.toLocaleString("es-AR")}
                </div>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Turnos Jugados</span>
                <div className="admin-kpi-val">{monthStats.totals.turnos}</div>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Promedio por Día Activo</span>
                <div className="admin-kpi-val" style={{ color: "#0369a1" }}>
                  ${promedioDiario.toLocaleString("es-AR")}
                </div>
              </div>
              <div className="admin-report-summary-card">
                <span className="admin-kpi-label">Ocupación Promedio</span>
                <div className="admin-kpi-val">{ocupacionPromedio}%</div>
              </div>
            </div>

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
                    <th>Recaudación</th>
                  </tr>
                </thead>
                <tbody>
                  {topDays.length > 0 ? (
                    topDays.map((d) => (
                      <tr key={d.date}>
                        <td>
                          <strong>{d.date}</strong>
                        </td>
                        <td>{d.turnos}</td>
                        <td>
                          {d.totalSlots
                            ? Math.round((d.turnos / d.totalSlots) * 100)
                            : 0}
                          %
                        </td>
                        <td
                          style={{
                            color: "#047857",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                          }}
                        >
                          ${d.ingresos.toLocaleString("es-AR")}
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
