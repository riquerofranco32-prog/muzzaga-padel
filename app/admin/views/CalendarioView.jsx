"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "../ui/states";
import { formatARS, formatPct, plural } from "../../../lib/format";
import { adminGetMonthStats } from "../actions";
import { todayInClub } from "../../../lib/booking";

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
  const todayIso = todayInClub();
  const [year, setYear] = useState(Number(todayIso.slice(0, 4)));
  const [month, setMonth] = useState(Number(todayIso.slice(5, 7))); // 1-12
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

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
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
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
          </button>
          <strong>
            {MONTH_NAMES[month - 1]} {year}
          </strong>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ height: 32, padding: "0 10px" }}
            onClick={() => changeMonth(1)}
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden />
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

          {!monthStats &&
            Array.from({ length: 30 }, (_, i) => (
              <Skeleton key={`sk-${i}`} height={72} radius={8} />
            ))}

          {monthStats?.days.map((d) => {
            const isClosed = d.totalSlots === 0;
            const ocupacionPct = d.ocupacionPct ?? 0;
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
                    : `${plural(d.turnos, "turno", "turnos")} · ${formatARS(d.cobrado)} cobrado · ${formatPct(d.ocupacionPct)} ocupación`
                }
              >
                <span className="admin-calendar-daynum">{d.day}</span>
                {!isClosed && (
                  <span className="admin-calendar-stat">
                    {d.turnos > 0 ? `${d.turnos} · ${formatPct(d.ocupacionPct)}` : "-"}
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
          Total del mes: <strong>{plural(monthStats.totals.turnos, "turno", "turnos")}</strong> ·{" "}
          <strong>{formatARS(monthStats.totals.cobrado)}</strong>{" "}
          recaudados. Tocá un día para ver su agenda.
        </div>
      )}
    </div>
  );
}
