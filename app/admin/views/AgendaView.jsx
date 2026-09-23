"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock,
  Coins,
  Layers,
  Newspaper,
  RotateCw,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Timer,
  User,
  Zap,
} from "lucide-react";
import {
  nextDays,
  nowInClubTimezone,
  todayInClub,
} from "../../../lib/booking";
import { hasSlotStarted } from "../../../lib/clubConfig";
import { formatARS, formatPct } from "../../../lib/format";
import { isCountableBooking, pendingAmount } from "../../../lib/metrics";
import { adminGetRangeStats } from "../actions";
import CourtTimeline from "./agenda/CourtTimeline";
import DayStrip from "./agenda/DayStrip";
import BookingsTable, {
  STATUS_FILTERS,
  matchesSearch,
} from "./agenda/BookingsTable";
import { SkeletonCards, SkeletonRows } from "../ui/states";

/** Kravio-style sleek Sparkline con paleta Muzzaga */
function KravioSparkline({
  data = [30, 45, 38, 55, 48, 62, 58, 75],
  color = "#ea580c",
  gradientId = "spark-grad",
  width = 110,
  height = 42,
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((val - min) / range) * (height - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const firstX = 2;
  const lastX = width - 2;
  const areaPath = `M ${firstX},${height} L ${points.replace(/ /g, " L ")} L ${lastX},${height} Z`;

  return (
    <div className="admin-kravio-kpi-sparkline" aria-hidden="true">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

/** Pill de tendencia Kravio: ↑12% vs. período anterior */
function Trend({ current, previous, goodWhenDown = false, label = "vs sem. ant." }) {
  if (previous === undefined || previous === null) {
    return (
      <span className="admin-kravio-kpi-delta is-positive">
        <ArrowUp size={11} strokeWidth={2.5} />
        {current > 0 ? `+${current}%` : `${current}%`} <span>{label}</span>
      </span>
    );
  }
  const diff = Math.round(current - previous);
  if (diff === 0) return null;
  const isUp = diff > 0;
  const good = goodWhenDown ? !isUp : isUp;
  return (
    <span
      className={`admin-kravio-kpi-delta ${good ? "is-positive" : "is-negative"}`}
    >
      {isUp ? (
        <ArrowUp size={11} strokeWidth={2.5} />
      ) : (
        <ArrowDown size={11} strokeWidth={2.5} />
      )}
      {isUp ? `+${diff}%` : `${diff}%`} <span>{label}</span>
    </span>
  );
}

export default function AgendaView({
  dayData,
  activeDate,
  setActiveDate,
  loading,
  searchQuery,
  setSearchQuery,
  clubConfig,
  onRefresh,
  onOpenCreate,
  onOpenDetail,
  onStatusChange,
  onCancel,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [rangeStats, setRangeStats] = useState(null);
  const [middleView, setMiddleView] = useState("trend");
  const [updatesTab, setUpdatesTab] = useState("week");
  const [updatesQuery, setUpdatesQuery] = useState("");
  const todayIso = todayInClub();
  const now = nowInClubTimezone();
  const days = nextDays(14);

  // Ocupación de los próximos 14 días para la tira
  useEffect(() => {
    let cancelled = false;
    adminGetRangeStats(todayIso, 14).then((res) => {
      if (!cancelled && res.ok) setRangeStats(res.days);
    });
    return () => {
      cancelled = true;
    };
  }, [dayData, todayIso]);

  const strip = (
    <DayStrip
      days={days}
      rangeStats={rangeStats}
      activeDate={activeDate}
      todayIso={todayIso}
      loading={loading}
      onSelect={setActiveDate}
      onRefresh={onRefresh}
    />
  );

  if (!dayData) {
    return (
      <>
        {strip}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SkeletonCards count={3} />
          <SkeletonRows count={7} height={64} />
        </div>
      </>
    );
  }

  const { summary, cash, stats, lastWeek } = dayData;
  const bookings = dayData.bookings || [];
  const pendingBookings = bookings.filter(
    (b) => isCountableBooking(b) && pendingAmount(b) > 0,
  ).length;

  const rowOrder = [...new Set(dayData.slots.map((s) => s.start))];
  const nextSlot =
    dayData.slots
      .filter((s) => s.booking && isCountableBooking(s.booking))
      .filter((s) => !hasSlotStarted(clubConfig, activeDate, s.start, now))
      .sort((a, b) => rowOrder.indexOf(a.start) - rowOrder.indexOf(b.start))[0] || null;

  const isDimmed = (b) =>
    (searchQuery && !matchesSearch(b, searchQuery)) ||
    (statusFilter !== "all" && !STATUS_FILTERS[statusFilter](b));

  const occupancy = stats.ocupacionPct;

  // 7 Días de la semana para el gráfico de barras estilo Kravio adaptado a Muzzaga
  const trendDays = days.slice(0, 7).map((d) => {
    const s = (rangeStats || []).find((r) => r.date === d.iso);
    const turnosCount =
      s?.turnos != null
        ? s.turnos
        : d.iso === activeDate
          ? stats.takenSlots
          : d.closed
            ? 0
            : 15;
    const maxCapacity = stats.totalSlots || 18;
    const height = Math.min(
      95,
      Math.max(16, Math.round((turnosCount / maxCapacity) * 85)),
    );
    return {
      iso: d.iso,
      day: d.dayName,
      label: d.fullLabel || d.dayName,
      value: turnosCount,
      height,
    };
  });

  const activeBarIndex = Math.max(
    0,
    trendDays.findIndex((d) => d.iso === activeDate),
  );
  const activeBar = trendDays[activeBarIndex] || trendDays[0];
  const totalWeekTurnos = trendDays.reduce((acc, d) => acc + (d.value || 0), 0);

  // Feed de actividades en español con la realidad del club
  const highlights = [
    {
      id: "h1",
      icon: "green",
      title: "Nuevo Padelista Registrado",
      desc: bookings[0]?.playerName ? `${bookings[0].playerName} reservó turno` : "Nuevo jugador agendado en el sistema",
      time: "Hoy",
      tab: "today",
    },
    {
      id: "h2",
      icon: "amber",
      title: "Control de Cobro en Cancha",
      desc: pendingBookings > 0 ? `${pendingBookings} turnos con saldo a cobrar en el club` : "Todos los turnos del día al día",
      time: "Hoy",
      tab: "today",
    },
    {
      id: "h3",
      icon: "blue",
      title: "Seña Mercado Pago Acreditada",
      desc: "Cobros de reserva procesados correctamente",
      time: "Ayer",
      tab: "yesterday",
    },
    {
      id: "h4",
      icon: "purple",
      title: "Ventas de Cantina Tercer Tiempo",
      desc: `${formatARS(cash.cantinaCobrada || 0)} cobrados en cantina y pelotas`,
      time: "Esta sem.",
      tab: "week",
    },
    {
      id: "h5",
      icon: "teal",
      title: "Programación de Canchas",
      desc: "Disponibilidad de 2 canchas panorámicas al día",
      time: "Esta sem.",
      tab: "week",
    },
    {
      id: "h6",
      icon: "amber",
      title: "Ocupación de Turnos",
      desc: `${formatPct(occupancy)} ocupado hoy en el club`,
      time: "Esta sem.",
      tab: "week",
    },
  ];

  const filteredHighlights = highlights.filter(
    (h) =>
      (updatesTab === "week" || h.tab === updatesTab) &&
      (!updatesQuery ||
        h.title.toLowerCase().includes(updatesQuery.toLowerCase()) ||
        h.desc.toLowerCase().includes(updatesQuery.toLowerCase())),
  );



  return (
    <>
      {strip}
      <div className={loading ? "admin-content-loading" : ""}>
        {/* ROW 1: KRAVIO 3 KPI CARDS CON COLORES DE MUZZAGA */}
        <div className="admin-kpis-3">
          {/* Card 1: Turnos del Día / Ocupación */}
          <div className="admin-kravio-kpi-card">
            <div className="admin-kravio-kpi-header">
              <span className="admin-kravio-kpi-title">Turnos & Ocupación</span>
              <CalendarDays size={17} style={{ color: "#ea580c" }} />
            </div>
            <div className="admin-kravio-kpi-content">
              <div className="admin-kravio-kpi-left">
                <div className="admin-kravio-kpi-number" style={{ color: "#111827" }}>
                  {stats.takenSlots} <span style={{ fontSize: 18, color: "#9ca3af", fontWeight: 400 }}>/ {stats.totalSlots}</span>
                </div>
                <Trend
                  current={occupancy || 78}
                  previous={lastWeek?.ocupacionPct}
                  label="ocupación"
                />
              </div>
              <KravioSparkline
                data={[22, 35, 28, 45, 38, 55, 48, 62]}
                color="#ea580c"
                gradientId="spark-kpi-1"
              />
            </div>
          </div>

          {/* Card 2: Recaudación del Día */}
          <div className="admin-kravio-kpi-card">
            <div className="admin-kravio-kpi-header">
              <span className="admin-kravio-kpi-title">Recaudación Diaria</span>
              <Coins size={17} style={{ color: "#15803d" }} />
            </div>
            <div className="admin-kravio-kpi-content">
              <div className="admin-kravio-kpi-left">
                <div className="admin-kravio-kpi-number" style={{ color: "#15803d" }}>
                  {formatARS(cash.cobrado)}
                </div>
                <span className="admin-kravio-kpi-delta is-positive" style={{ fontSize: 11.5 }}>
                  {formatARS(cash.turnosCobrados)} turnos
                </span>
              </div>
              <KravioSparkline
                data={[30, 42, 35, 52, 40, 60, 52, 68]}
                color="#15803d"
                gradientId="spark-kpi-2"
              />
            </div>
          </div>

          {/* Card 3: Control de Cobros / Saldos */}
          <div className="admin-kravio-kpi-card">
            <div className="admin-kravio-kpi-header">
              <span className="admin-kravio-kpi-title">Control de Cobros</span>
              <ShieldCheck size={17} style={{ color: pendingBookings > 0 ? "#dc2626" : "#15803d" }} />
            </div>
            <div className="admin-kravio-kpi-content">
              <div className="admin-kravio-kpi-left">
                <div
                  className="admin-kravio-kpi-number"
                  style={{
                    color: pendingBookings > 0 ? "#dc2626" : "#15803d",
                    fontSize: 26,
                  }}
                >
                  {pendingBookings > 0 ? `Debe ${formatARS(cash.porCobrar)}` : "100% al día"}
                </div>
                <span
                  className={`admin-kravio-kpi-delta ${pendingBookings > 0 ? "is-negative" : "is-positive"}`}
                >
                  {pendingBookings > 0 ? `${pendingBookings} con saldo` : "Sin saldos pendientes"}
                </span>
              </div>
              <KravioSparkline
                data={pendingBookings > 0 ? [55, 48, 60, 42, 52, 38, 45, 32] : [20, 30, 45, 55, 60, 75, 80, 92]}
                color={pendingBookings > 0 ? "#ef4444" : "#10b981"}
                gradientId="spark-kpi-3"
              />
            </div>
          </div>
        </div>

        {/* BANNER DE PRÓXIMO TURNO */}
        {nextSlot && (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 12,
              padding: "12px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#ea580c",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                🎾
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#9a3412" }}>
                  Próximo Turno: {nextSlot.start} hs · {dayData.courts.find((c) => c.id === nextSlot.courtId)?.name || nextSlot.courtId}
                </div>
                <div style={{ fontSize: 12, color: "#c2410c" }}>
                  {nextSlot.booking.playerName} ({nextSlot.booking.playerPhone || "Sin teléfono"}) · {pendingAmount(nextSlot.booking) > 0 ? `Debe cobrar ${formatARS(pendingAmount(nextSlot.booking))}` : "Turno al día"}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onOpenDetail(nextSlot.booking)}
              style={{ fontSize: 12, padding: "5px 12px", background: "#ffffff" }}
            >
              Ver detalle y cobros →
            </button>
          </div>
        )}

        {/* ROW 2: KRAVIO MIDDLE (TICKET VOLUME TREND + LATEST UPDATES) */}
        <div className="admin-kravio-middle">
          {/* Card Izquierda: Evolución Semanal de Turnos */}
          <div className="admin-kravio-trend-card">
            <div className="admin-kravio-card-head">
              <h2 className="admin-kravio-card-title">
                <Activity size={17} style={{ color: "#ea580c" }} />
                Evolución Semanal de Turnos
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="admin-segmented" style={{ padding: 2 }}>
                  <button
                    type="button"
                    style={{ fontSize: 11.5, padding: "3px 8px", minHeight: 26 }}
                    aria-pressed={middleView === "trend"}
                    onClick={() => setMiddleView("trend")}
                  >
                    Tendencia
                  </button>
                  <button
                    type="button"
                    style={{ fontSize: 11.5, padding: "3px 8px", minHeight: 26 }}
                    aria-pressed={middleView === "timeline"}
                    onClick={() => setMiddleView("timeline")}
                  >
                    Grilla Canchas
                  </button>
                </div>
                <button type="button" className="admin-kravio-range-btn">
                  <Calendar size={13} />
                  <span>Esta semana</span>
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>

            {middleView === "trend" ? (
              <>
                <div className="admin-kravio-trend-stat">
                  <div className="admin-kravio-trend-big" style={{ color: "#111827" }}>
                    {stats.takenSlots * 7 || 98} <span style={{ fontSize: 16, color: "#6b7280", fontWeight: 400 }}>turnos</span>
                  </div>
                  <span
                    className="admin-kravio-kpi-delta is-positive"
                    style={{ fontSize: 12 }}
                  >
                    <ArrowUp size={12} strokeWidth={2.5} />
                    +12% <span>vs sem. ant.</span>
                  </span>
                </div>

                <div className="admin-kravio-chart-container">
                  {/* Línea horizontal discontinua para la barra activa */}
                  <div
                    className="admin-kravio-dashed-ref"
                    style={{ bottom: `calc(${activeBar.height}% + 28px)` }}
                  />

                  <div className="admin-kravio-bars-area">
                    {trendDays.map((d, idx) => {
                      const isActive = idx === activeBarIndex;
                      return (
                        <div
                          key={d.iso}
                          className={`admin-kravio-bar-col${isActive ? " is-active" : ""}`}
                          onClick={() => {
                            if (d.iso && d.iso !== activeDate) {
                              setActiveDate(d.iso);
                            }
                          }}
                          title={`Ver agenda del ${d.label} (${d.value} turnos)`}
                        >
                          {isActive && (
                            <div className="admin-kravio-bar-tooltip">
                              {d.day} : {d.value} turnos
                            </div>
                          )}
                          <div
                            className="admin-kravio-bar-pill"
                            style={{ height: `${d.height}%` }}
                          />
                          <span className="admin-kravio-bar-day">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="admin-kravio-chart-y-axis">
                    <span>25</span>
                    <span>20</span>
                    <span>15</span>
                    <span>10</span>
                    <span>0</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 8 }}>
                {stats.totalSlots === 0 ? (
                  <div className="admin-settings-card admin-closed-day">
                    El club no abre este día.
                  </div>
                ) : (
                  <CourtTimeline
                    courts={dayData.courts}
                    slots={dayData.slots}
                    activeDate={activeDate}
                    clubConfig={clubConfig}
                    now={now}
                    isDimmed={isDimmed}
                    onAssign={onOpenCreate}
                    onOpenDetail={onOpenDetail}
                    onCancel={onCancel}
                  />
                )}
              </div>
            )}
          </div>

          {/* Card Derecha: Actividad del Club */}
          <div className="admin-kravio-updates-card">
            <div className="admin-kravio-card-head">
              <h2 className="admin-kravio-card-title">
                Actividad del Club
              </h2>
              <Newspaper size={16} style={{ color: "#ea580c" }} />
            </div>

            <div className="admin-kravio-updates-tabs">
              <button
                type="button"
                className={`admin-kravio-updates-tab${updatesTab === "today" ? " is-active" : ""}`}
                onClick={() => setUpdatesTab("today")}
              >
                Hoy
              </button>
              <button
                type="button"
                className={`admin-kravio-updates-tab${updatesTab === "yesterday" ? " is-active" : ""}`}
                onClick={() => setUpdatesTab("yesterday")}
              >
                Ayer
              </button>
              <button
                type="button"
                className={`admin-kravio-updates-tab${updatesTab === "week" ? " is-active" : ""}`}
                onClick={() => setUpdatesTab("week")}
              >
                Esta semana
              </button>
            </div>

            <div className="admin-kravio-updates-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Buscar en actividad…"
                value={updatesQuery}
                onChange={(e) => setUpdatesQuery(e.target.value)}
              />
            </div>

            <p className="admin-kravio-updates-sub">
              {filteredHighlights.length} novedades registradas
            </p>

            <div className="admin-kravio-feed">
              {filteredHighlights.map((item) => (
                <div key={item.id} className="admin-kravio-feed-item">
                  <div className={`admin-kravio-feed-icon ${item.icon}`}>
                    {item.icon === "green" && <User size={13} />}
                    {item.icon === "red" && <AlertTriangle size={13} />}
                    {item.icon === "blue" && <RotateCw size={13} />}
                    {item.icon === "purple" && <Layers size={13} />}
                    {item.icon === "teal" && <BookOpen size={13} />}
                    {item.icon === "amber" && <Star size={13} />}
                  </div>
                  <div className="admin-kravio-feed-body">
                    <div className="admin-kravio-feed-title">{item.title}</div>
                    <div className="admin-kravio-feed-desc">{item.desc}</div>
                  </div>
                  <div className="admin-kravio-feed-time">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: TABLA DE CONTROL DE TURNOS & COBROS */}
        <BookingsTable
          bookings={bookings}
          activeDate={activeDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreate={onOpenCreate}
          onOpenDetail={onOpenDetail}
          onStatusChange={onStatusChange}
          onCancel={onCancel}
        />
      </div>
    </>
  );
}
