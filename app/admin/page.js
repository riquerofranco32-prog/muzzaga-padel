"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminCancelBooking,
  adminCreateManualBooking,
  adminLogout,
  adminUpdateStatus,
  checkAdminSession,
  getAdminDayData,
  verifyAdminPassword,
} from "./actions";
import {
  COURTS,
  SLOT_DURATION_MIN,
  addMinutes,
  nextDays,
  priceForSlot,
  toISODate,
} from "../../lib/booking";
import { toWhatsappNumber } from "../../lib/phone";

const DAYS = nextDays(14);
const START_TIMES = [
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:30",
  "23:00",
];

const STATUS_OPTIONS = [
  { value: "confirmado", label: "Confirmado" },
  { value: "señado", label: "Señado" },
  { value: "pagado", label: "Pagado Total" },
  { value: "bloqueado", label: "Bloqueado / Mantenimiento" },
  { value: "cancelado", label: "Cancelado" },
];

/** Clase de color del badge según estado. Sin acento para usarla como clase CSS. */
function statusClass(status) {
  return `is-${status === "señado" ? "senado" : status || "confirmado"}`;
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconRefresh({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function IconClipboard({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function IconPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function IconClose({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function IconTrash({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconPhone({ size = 12 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconSearch({ size = 14 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconAlert({ size = 12 }) {
  return (
    <svg width={size} height={size} {...ICON_PROPS}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function WhatsAppMiniIcon({ size = 13 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard Data State
  const [activeDate, setActiveDate] = useState(toISODate(new Date()));
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    courtId: "cancha-1",
    startTime: "18:30",
    playerName: "",
    playerPhone: "",
    playersCount: 4,
    fullCourt: true,
    status: "confirmado",
    notes: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // La sesión vive en una cookie httpOnly firmada: el cliente no puede leerla
  // ni falsearla, así que le preguntamos al servidor si sigue vigente.
  useEffect(() => {
    let cancelled = false;
    checkAdminSession().then((res) => {
      if (cancelled) return;
      setIsAuthenticated(res.ok);
      setSessionChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch day data when date or auth changes
  useEffect(() => {
    if (!isAuthenticated) return;
    loadDayData(activeDate);
  }, [isAuthenticated, activeDate]);

  /**
   * Si la cookie venció mientras el panel estaba abierto, los actions
   * devuelven el error de sesión: en ese caso volvemos al login en vez de
   * dejar la pantalla con datos viejos y botones que no hacen nada.
   * @returns {boolean} true si la sesión se cayó y ya se manejó.
   */
  function handleExpiredSession(res) {
    if (res?.ok || !res?.error?.startsWith("Sesión expirada")) return false;
    setIsAuthenticated(false);
    setDayData(null);
    setAuthError(res.error);
    return true;
  }

  async function loadDayData(date) {
    setLoading(true);
    const res = await getAdminDayData(date);
    setLoading(false);
    if (res.ok) {
      setDayData(res);
    } else if (!handleExpiredSession(res)) {
      setActionMessage("⚠️ " + (res.error || "Error al cargar datos"));
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const res = await verifyAdminPassword(pinInput);
    setAuthLoading(false);
    if (res.ok) {
      // La cookie de sesión ya vino en la respuesta del server action.
      setIsAuthenticated(true);
      setPinInput("");
    } else {
      setAuthError(res.error || "Contraseña incorrecta");
    }
  }

  async function handleLogout() {
    await adminLogout();
    setIsAuthenticated(false);
    setDayData(null);
    setPinInput("");
  }

  async function handleStatusChange(bookingId, newStatus) {
    const res = await adminUpdateStatus(bookingId, newStatus);
    if (res.ok) {
      setActionMessage("✓ Estado actualizado");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2000);
    } else if (!handleExpiredSession(res)) {
      alert(res.error || "No se pudo actualizar el estado.");
    }
  }

  async function handleCancel(bookingId, courtId, startTime) {
    if (
      !confirm(
        `¿Estás seguro de cancelar este turno de las ${startTime} hs y liberar la cancha?`,
      )
    )
      return;
    const res = await adminCancelBooking(
      bookingId,
      activeDate,
      courtId,
      startTime,
    );
    if (res.ok) {
      setActionMessage("✓ Turno cancelado y horario liberado");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2500);
    } else if (!handleExpiredSession(res)) {
      alert(res.error || "No se pudo cancelar el turno.");
    }
  }

  function openCreateModal(courtId, startTime) {
    setModalForm({
      courtId: courtId || "cancha-1",
      startTime: startTime || "18:30",
      playerName: "",
      playerPhone: "",
      playersCount: 4,
      fullCourt: true,
      status: "confirmado",
      notes: "",
    });
    setIsModalOpen(true);
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setModalSubmitting(true);
    const res = await adminCreateManualBooking({
      date: activeDate,
      ...modalForm,
      // El fin siempre se deriva del inicio: antes quedaba fijo en "20:00"
      // y se guardaba mal en cualquier turno que no arrancara 18:30.
      endTime: addMinutes(modalForm.startTime, SLOT_DURATION_MIN),
    });
    setModalSubmitting(false);
    if (res.ok) {
      setIsModalOpen(false);
      setActionMessage("✓ Reserva creada exitosamente");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2500);
    } else if (!handleExpiredSession(res)) {
      alert(res.error || "Error al crear la reserva");
    }
  }

  function copyDaySchedule() {
    if (!dayData) return;
    let text = `📋 *PLANILLA DE TURNOS - MUZZAGA PÁDEL*\n`;
    text += `📅 *Fecha:* ${dayData.date}\n`;
    text += `🎾 *Ocupación:* ${dayData.stats.takenSlots}/${dayData.stats.totalSlots} turnos (${dayData.stats.ocupacionPct}%)\n\n`;

    COURTS.forEach((court) => {
      text += `🏟️ *${court.name.toUpperCase()} (${court.type}):*\n`;
      const courtSlots = dayData.slots.filter((s) => s.courtId === court.id);
      courtSlots.forEach((slot) => {
        if (slot.isTaken && slot.booking) {
          const b = slot.booking;
          const statusIcon =
            b.status === "pagado" ? "🟢" : b.status === "señado" ? "🟡" : "🔵";
          text += `  ${slot.start} hs: ${statusIcon} ${b.playerName} (${b.playersCount}p) - Tel: ${b.playerPhone || "N/D"}\n`;
        } else {
          text += `  ${slot.start} hs: ⚪ LIBRE\n`;
        }
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setActionMessage("✓ Planilla del día copiada para WhatsApp");
    setTimeout(() => setActionMessage(""), 2500);
  }

  // Mientras el servidor confirma la cookie no mostramos nada: si no, al
  // admin ya logueado le parpadea el formulario en cada recarga.
  if (!sessionChecked) {
    return (
      <div className="admin-login-wrapper">
        <p style={{ color: "var(--color-muted)", fontSize: 14 }}>
          Verificando sesión…
        </p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <img
              src="/img/logo_badge.png"
              alt="Muzzaga Pádel"
              width={56}
              height={56}
              style={{
                width: 56,
                height: 56,
                margin: "0 auto 12px",
                display: "block",
                objectFit: "contain",
              }}
            />
            <h1
              style={{
                fontSize: 22,
                color: "var(--color-ink)",
                fontWeight: 700,
                margin: 0,
              }}
            >
              Muzzaga Pádel Admin
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginTop: 4,
              }}
            >
              Panel de Control y Gestión Operativa de Canchas
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Contraseña de Administrador:
            </label>
            <input
              type="password"
              className="admin-input-field"
              placeholder="Ingresá contraseña"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
            />

            {authError && <div className="admin-error-text">{authError}</div>}

            <button
              type="submit"
              className="btn btn-linear-primary"
              style={{
                width: "100%",
                height: 44,
                marginTop: 16,
                justifyContent: "center",
              }}
              disabled={authLoading}
            >
              {authLoading ? "Verificando..." : "Ingresar al Panel →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: "var(--accent-sky)",
                textDecoration: "none",
              }}
            >
              ← Volver a la Landing Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  function bookingMatchesSearch(b) {
    if (!searchQuery || !b) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.playerName?.toLowerCase().includes(q) ||
      b.playerPhone?.includes(q) ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.courtName?.toLowerCase().includes(q)
    );
  }

  const filteredBookings =
    dayData?.bookings?.filter(bookingMatchesSearch) || [];

  // Mismo cálculo que hace el server action, para que el modal muestre
  // exactamente el total que se va a guardar.
  const modalRate = priceForSlot(activeDate, modalForm.startTime);
  const perPlayerPrice = modalRate.perPlayer;
  const modalPrice = modalForm.fullCourt
    ? modalRate.total
    : (modalForm.playersCount || 4) * modalRate.perPlayer;

  return (
    <div className="admin-dashboard-layout">
      {/* TOP HEADER */}
      <header className="admin-top-bar">
        <div className="container admin-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/img/logo_badge.png"
              alt="Muzzaga"
              width={32}
              height={32}
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
                display: "block",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 17, color: "var(--color-ink)" }}>
                  Muzzaga Admin
                </strong>
                <span
                  className={`badge-linear ${dayData?.firebaseOk ? "badge-emerald" : "badge-amber"}`}
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title={
                    dayData?.firebaseOk
                      ? "Conectado a la base de datos"
                      : "No se pudo confirmar la conexión a Firebase: los datos pueden no ser reales"
                  }
                >
                  {dayData?.firebaseOk ? (
                    <>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "currentColor",
                        }}
                      />
                      Conectado Firebase
                    </>
                  ) : (
                    <>
                      <IconAlert size={11} /> Firebase sin confirmar
                    </>
                  )}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Catriel, Río Negro
              </span>
            </div>
          </div>

          <div
            className="admin-nav-actions"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {actionMessage && (
              <span className="admin-toast-badge">{actionMessage}</span>
            )}
            <button
              type="button"
              onClick={copyDaySchedule}
              className="btn btn-secondary"
              style={{ height: 36, padding: "6px 12px", fontSize: 12.5 }}
            >
              <IconClipboard /> Copiar Planilla WhatsApp
            </button>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="btn btn-linear-primary"
              style={{ height: 36, padding: "6px 14px", fontSize: 13 }}
            >
              <IconPlus /> Nueva Reserva Manual
            </button>
            <Link
              href="/"
              target="_blank"
              className="btn btn-secondary"
              style={{ height: 36, padding: "6px 12px", fontSize: 12.5 }}
            >
              ↗ Ver Web
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                height: 36,
                padding: "6px 12px",
                fontSize: 12.5,
                color: "#b91c1c",
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "28px 20px 80px" }}>
        {/* DATE SELECTOR BAR */}
        <div className="admin-date-picker-row">
          <div className="admin-dates-scroll">
            {DAYS.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={`admin-date-tab${activeDate === d.iso ? " active" : ""}`}
                onClick={() => setActiveDate(d.iso)}
              >
                <span
                  style={{
                    fontSize: 11,
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  {d.dayName}
                </span>
                <strong style={{ fontSize: 17, display: "block" }}>
                  {d.dayNumber}
                </strong>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {d.monthName}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadDayData(activeDate)}
            style={{ height: 42, padding: "8px 14px" }}
            disabled={loading}
          >
            {loading ? (
              "Actualizando..."
            ) : (
              <>
                <IconRefresh /> Refrescar
              </>
            )}
          </button>
        </div>

        {/* STATS / KPIS ROW */}
        {dayData && (
          <div className="admin-kpis-grid">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Ocupación del Día</span>
              <div className="admin-kpi-val">
                {dayData.stats.takenSlots} / {dayData.stats.totalSlots}
                <span className="admin-kpi-sub">
                  ({dayData.stats.ocupacionPct}%)
                </span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Recaudación Estimada</span>
              <div className="admin-kpi-val" style={{ color: "#047857" }}>
                ${dayData.stats.ingresosEstimados.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Horarios Disponibles</span>
              <div className="admin-kpi-val" style={{ color: "#0369a1" }}>
                {dayData.stats.libres} libres
              </div>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Reservas Confirmadas</span>
              <div className="admin-kpi-val">
                {dayData.bookings.length} partidos
              </div>
            </div>
          </div>
        )}

        <div className={loading ? "admin-content-loading" : ""}>
          {/* COURT TIMELINES (CANCHA 1 VS CANCHA 2) */}
          <div style={{ marginTop: 32 }}>
            <h2 className="admin-section-title">
              Grilla Horaria de Pistas ({activeDate})
            </h2>

            <div className="admin-courts-timeline-grid">
              {COURTS.map((court) => {
                const courtSlots =
                  dayData?.slots?.filter((s) => s.courtId === court.id) || [];
                return (
                  <div key={court.id} className="admin-court-col">
                    <div className="admin-court-col-header">
                      <div>
                        <strong
                          style={{ fontSize: 16, color: "var(--color-ink)" }}
                        >
                          {court.name}
                        </strong>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginLeft: 6,
                          }}
                        >
                          ({court.type})
                        </span>
                      </div>
                      <span className="badge-linear badge-emerald">
                        {courtSlots.filter((s) => s.isTaken).length} reservados
                      </span>
                    </div>

                    <div className="admin-slots-vertical-list">
                      {courtSlots.map((slot) => {
                        const b = slot.booking;
                        const isTaken = slot.isTaken;
                        const isDimmed =
                          searchQuery && isTaken && !bookingMatchesSearch(b);

                        return (
                          <div
                            key={slot.slotKey}
                            className={`admin-timeline-slot${isTaken ? " occupied" : " free"}${isDimmed ? " dimmed" : ""}`}
                          >
                            <div className="admin-slot-time-col">
                              <strong>{slot.start}</strong>
                              <span>{slot.end}</span>
                            </div>

                            <div className="admin-slot-info-col">
                              {isTaken && b ? (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <div>
                                      <strong
                                        style={{
                                          fontSize: 14,
                                          color: "var(--color-ink)",
                                        }}
                                      >
                                        {b.playerName}
                                      </strong>
                                      {b.playerPhone && (
                                        <span
                                          style={{
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                          }}
                                        >
                                          <IconPhone /> {b.playerPhone}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className={`admin-status-badge ${statusClass(b.status)}`}
                                    >
                                      {b.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      marginTop: 8,
                                      alignItems: "center",
                                    }}
                                  >
                                    {b.playerPhone && (
                                      <a
                                        href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}?text=${encodeURIComponent(
                                          `Hola ${b.playerName}! Te escribimos de Muzzaga Pádel por tu turno del ${activeDate} a las ${slot.start} hs en ${court.name}. ¿Todo bien?`,
                                        )}`}
                                        target="_blank"
                                        rel="noopener"
                                        className="admin-mini-btn whatsapp"
                                        title="Escribir por WhatsApp"
                                      >
                                        <WhatsAppMiniIcon /> WhatsApp
                                      </a>
                                    )}

                                    <select
                                      className="admin-mini-select"
                                      data-status={statusClass(b.status)}
                                      value={b.status}
                                      onChange={(e) =>
                                        e.target.value === "cancelado"
                                          ? handleCancel(
                                              b.id,
                                              court.id,
                                              slot.start,
                                            )
                                          : handleStatusChange(
                                              b.id,
                                              e.target.value,
                                            )
                                      }
                                    >
                                      {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>

                                    <button
                                      type="button"
                                      className="admin-mini-btn cancel"
                                      onClick={() =>
                                        handleCancel(b.id, court.id, slot.start)
                                      }
                                      title="Cancelar turno y liberar horario"
                                    >
                                      <IconClose size={11} /> Liberar
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 13,
                                      color: "var(--text-muted)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background:
                                          "var(--color-hairline-strong)",
                                        display: "inline-block",
                                      }}
                                    />
                                    Horario Disponible
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{
                                      height: 28,
                                      padding: "2px 10px",
                                      fontSize: 11,
                                    }}
                                    onClick={() =>
                                      openCreateModal(court.id, slot.start)
                                    }
                                  >
                                    <IconPlus size={11} /> Asignar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETAILED BOOKINGS TABLE */}
          <div style={{ marginTop: 40 }}>
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
                Listado de Reservas del Día ({filteredBookings.length})
              </h2>

              <div className="admin-search-wrap">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o código..."
                  className="admin-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                  >
                    <IconClose size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cancha</th>
                    <th>Horario</th>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <code style={{ color: "#0369a1", fontWeight: 600 }}>
                            {b.bookingCode}
                          </code>
                        </td>
                        <td>{b.courtName}</td>
                        <td>
                          <strong>{b.startTime}</strong> - {b.endTime} hs
                        </td>
                        <td>
                          <strong>{b.playerName}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {b.playerPhone || "-"}
                          </span>
                        </td>
                        <td>
                          <strong
                            style={{
                              color: "#047857",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            $
                            {(typeof b.total === "number"
                              ? b.total
                              : b.fullCourt !== false
                                ? priceForSlot(
                                    b.date || activeDate,
                                    b.startTime,
                                  ).total
                                : (b.playersCount || 4) *
                                  priceForSlot(
                                    b.date || activeDate,
                                    b.startTime,
                                  ).perPlayer
                            ).toLocaleString("es-AR")}
                          </strong>
                        </td>
                        <td>
                          <select
                            className="admin-mini-select"
                            data-status={statusClass(b.status)}
                            value={b.status}
                            onChange={(e) =>
                              e.target.value === "cancelado"
                                ? handleCancel(b.id, b.courtId, b.startTime)
                                : handleStatusChange(b.id, e.target.value)
                            }
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {b.playerPhone && (
                              <a
                                href={`https://wa.me/${toWhatsappNumber(b.playerPhone)}`}
                                target="_blank"
                                rel="noopener"
                                className="admin-table-action-btn"
                                title="Chat WhatsApp"
                              >
                                <WhatsAppMiniIcon />
                              </a>
                            )}
                            <button
                              type="button"
                              className="admin-table-action-btn delete"
                              onClick={() =>
                                handleCancel(b.id, b.courtId, b.startTime)
                              }
                              title="Cancelar reserva"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {searchQuery ? (
                          <>
                            No hay reservas que coincidan con "{searchQuery}".{" "}
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              style={{
                                color: "var(--color-accent-orange)",
                                fontWeight: 600,
                                textDecoration: "underline",
                              }}
                            >
                              Limpiar búsqueda
                            </button>
                          </>
                        ) : (
                          "No hay reservas registradas para esta fecha."
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PARA CREAR RESERVA MANUAL O BLOQUEO */}
      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  color: "var(--color-ink)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <IconPlus size={16} /> Cargar Turno Manual / Bloquear
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <IconClose size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label className="admin-field-label">Cancha:</label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.courtId}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, courtId: e.target.value })
                    }
                  >
                    {COURTS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-field-label">Horario:</label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.startTime}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, startTime: e.target.value })
                    }
                  >
                    {START_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t} a {addMinutes(t, SLOT_DURATION_MIN)} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="admin-field-label">
                  Nombre del Jugador o Motivo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez (o 'Clase Profe Nico')"
                  className="admin-input-field"
                  value={modalForm.playerName}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, playerName: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label className="admin-field-label">
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 299 597 4176"
                    className="admin-input-field"
                    value={modalForm.playerPhone}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        playerPhone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-field-label">Estado Inicial:</label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.status}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, status: e.target.value })
                    }
                  >
                    {STATUS_OPTIONS.filter((o) => o.value !== "cancelado").map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label className="admin-field-label">
                    Cantidad de Jugadores:
                  </label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.playersCount}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        playersCount: Number(e.target.value),
                      })
                    }
                    disabled={modalForm.fullCourt}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "jugador" : "jugadores"}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={modalForm.fullCourt}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        fullCourt: e.target.checked,
                      })
                    }
                  />
                  Cancha completa
                </label>
              </div>

              <div className="admin-modal-hint">
                Se va a guardar de <strong>{modalForm.startTime}</strong> a{" "}
                <strong>
                  {addMinutes(modalForm.startTime, SLOT_DURATION_MIN)}
                </strong>{" "}
                hs · Total{" "}
                <strong>${modalPrice.toLocaleString("es-AR")}</strong>
                {!modalForm.fullCourt &&
                  ` (${modalForm.playersCount} × $${perPlayerPrice.toLocaleString("es-AR")})`}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="admin-field-label">
                  Notas u Observaciones (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cumpleaños, clase con profe, cancha en mantenimiento"
                  className="admin-input-field"
                  value={modalForm.notes}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, notes: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-linear-primary"
                style={{ width: "100%", height: 44, justifyContent: "center" }}
                disabled={modalSubmitting}
              >
                {modalSubmitting
                  ? "Guardando..."
                  : "Confirmar y Guardar Turno →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
