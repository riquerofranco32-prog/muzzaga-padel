"use client";

import { useEffect, useState } from "react";
import { adminGetMonthStats } from "../actions";
import { toISODate } from "../../../lib/booking";

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
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarioView({ onSelectDate, onExpiredSession }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
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

  function changeMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  }

  const todayIso = toISODate(today);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekday });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>
          Calendario de Ocupación
        </h2>
        <div className="admin-calendar-nav">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 32, padding: "0 10px" }}
            onClick={() => changeMonth(-1)}
          >
            ←
          </button>
          <strong>
            {MONTH_NAMES[month - 1]} {year}
          </strong>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 32, padding: "0 10px" }}
            onClick={() => changeMonth(1)}
          >
            →
          </button>
        </div>
      </div>

      <div className={loading ? "admin-content-loading" : ""}>
        <div className="admin-calendar-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="admin-calendar-weekday">
              {w}
            </div>
          ))}

          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="admin-calendar-cell is-empty" />
          ))}

          {monthStats?.days.map((d) => {
            const isClosed = d.totalSlots === 0;
            const ocupacionPct = d.totalSlots
              ? Math.round((d.turnos / d.totalSlots) * 100)
              : 0;
            return (
              <div
                key={d.date}
                className={`admin-calendar-cell${d.date === todayIso ? " is-today" : ""}${isClosed ? " is-closed" : ""}`}
                style={
                  !isClosed && ocupacionPct > 0
                    ? {
                        background: `rgba(232, 114, 42, ${Math.min(0.55, 0.08 + ocupacionPct / 180)})`,
                      }
                    : undefined
                }
                onClick={() => !isClosed && onSelectDate(d.date)}
                title={
                  isClosed
                    ? "Cerrado"
                    : `${d.turnos} turnos · $${d.ingresos.toLocaleString("es-AR")} · ${ocupacionPct}% ocupación`
                }
              >
                <span className="admin-calendar-daynum">{d.day}</span>
                {!isClosed && (
                  <span className="admin-calendar-stat">
                    {d.turnos > 0 ? `${d.turnos} · ${ocupacionPct}%` : "-"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {monthStats && (
        <div
          style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}
        >
          Total del mes: <strong>{monthStats.totals.turnos} turnos</strong> ·{" "}
          <strong>${monthStats.totals.ingresos.toLocaleString("es-AR")}</strong>{" "}
          recaudados. Tocá un día para ver su agenda.
        </div>
      )}
    </div>
  );
}
