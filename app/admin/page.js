"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminCancelBooking,
  adminCreateManualBooking,
  adminUpdateStatus,
  getAdminDayData,
  verifyAdminPassword,
} from "./actions";
import { COURTS, nextDays, priceForSlot, toISODate } from "../../lib/booking";

const DAYS = nextDays(14);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    endTime: "20:00",
    playerName: "",
    playerPhone: "",
    playersCount: 4,
    fullCourt: true,
    status: "confirmado",
    notes: "",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check saved session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("muzzaga_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch day data when date or auth changes
  useEffect(() => {
    if (!isAuthenticated) return;
    loadDayData(activeDate);
  }, [isAuthenticated, activeDate]);

  async function loadDayData(date) {
    setLoading(true);
    const res = await getAdminDayData(date);
    setLoading(false);
    if (res.ok) {
      setDayData(res);
    } else {
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
      setIsAuthenticated(true);
      sessionStorage.setItem("muzzaga_admin_auth", "true");
    } else {
      setAuthError(res.error || "PIN incorrecto");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("muzzaga_admin_auth");
    setIsAuthenticated(false);
    setPinInput("");
  }

  async function handleStatusChange(bookingId, newStatus) {
    const res = await adminUpdateStatus(bookingId, newStatus);
    if (res.ok) {
      setActionMessage("✓ Estado actualizado");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2000);
    }
  }

  async function handleCancel(bookingId, courtId, startTime) {
    if (!confirm(`¿Estás seguro de cancelar este turno de las ${startTime} hs y liberar la cancha?`)) return;
    const res = await adminCancelBooking(bookingId, activeDate, courtId, startTime);
    if (res.ok) {
      setActionMessage("✓ Turno cancelado y horario liberado");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2500);
    } else {
      alert(res.error || "No se pudo cancelar el turno.");
    }
  }

  function openCreateModal(courtId, startTime) {
    setModalForm({
      courtId: courtId || "cancha-1",
      startTime: startTime || "18:30",
      endTime: "20:00",
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
    });
    setModalSubmitting(false);
    if (res.ok) {
      setIsModalOpen(false);
      setActionMessage("✓ Reserva creada exitosamente");
      loadDayData(activeDate);
      setTimeout(() => setActionMessage(""), 2500);
    } else {
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
          const statusIcon = b.status === "pagado" ? "🟢" : b.status === "señado" ? "🟡" : "🔵";
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

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="brand-mark" style={{ width: 44, height: 44, margin: "0 auto 12px" }}>M</div>
            <h1 style={{ fontSize: 22, color: "#ffffff", fontWeight: 700, margin: 0 }}>
              Muzzaga Pádel Admin
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
              Panel de Control y Gestión Operativa de Canchas
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Contraseña o PIN de Administrador:
            </label>
            <input
              type="password"
              className="admin-input-field"
              placeholder="Ingresá PIN (ej. 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
            />

            {authError && <div className="admin-error-text">{authError}</div>}

            <button
              type="submit"
              className="btn btn-linear-primary"
              style={{ width: "100%", height: 44, marginTop: 16, justifyContent: "center" }}
              disabled={authLoading}
            >
              {authLoading ? "Verificando..." : "Ingresar al Panel →"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/" style={{ fontSize: 13, color: "var(--accent-sky)", textDecoration: "none" }}>
              ← Volver a la Landing Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  const filteredBookings = dayData?.bookings?.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.playerName?.toLowerCase().includes(q) ||
      b.playerPhone?.includes(q) ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.courtName?.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="admin-dashboard-layout">
      {/* TOP HEADER */}
      <header className="admin-top-bar">
        <div className="container admin-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="brand-mark">M</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 17, color: "#ffffff" }}>Muzzaga Admin</strong>
                <span className="badge-linear badge-emerald" style={{ fontSize: 10, padding: "2px 6px" }}>
                  ● Conectado Firebase
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Catriel, Río Negro</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {actionMessage && <span className="admin-toast-badge">{actionMessage}</span>}
            <button type="button" onClick={copyDaySchedule} className="btn btn-secondary" style={{ height: 36, padding: "6px 12px", fontSize: 12.5 }}>
              📋 Copiar Planilla WhatsApp
            </button>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="btn btn-linear-primary"
              style={{ height: 36, padding: "6px 14px", fontSize: 13 }}
            >
              + Nueva Reserva Manual
            </button>
            <Link href="/" target="_blank" className="btn btn-secondary" style={{ height: 36, padding: "6px 12px", fontSize: 12.5 }}>
              ↗ Ver Web
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ height: 36, padding: "6px 12px", fontSize: 12.5, color: "#f87171" }}
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
                <span style={{ fontSize: 11, display: "block", textTransform: "uppercase" }}>
                  {d.dayName}
                </span>
                <strong style={{ fontSize: 17, display: "block" }}>{d.dayNumber}</strong>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.monthName}</span>
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
            {loading ? "Actualizando..." : "🔄 Refrescar"}
          </button>
        </div>

        {/* STATS / KPIS ROW */}
        {dayData && (
          <div className="admin-kpis-grid">
            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Ocupación del Día</span>
              <div className="admin-kpi-val">
                {dayData.stats.takenSlots} / {dayData.stats.totalSlots}
                <span className="admin-kpi-sub">({dayData.stats.ocupacionPct}%)</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Recaudación Estimada</span>
              <div className="admin-kpi-val" style={{ color: "#34d399" }}>
                ${dayData.stats.ingresosEstimados.toLocaleString("es-AR")}
              </div>
            </div>

            <div className="admin-kpi-card">
              <span className="admin-kpi-label">Horarios Disponibles</span>
              <div className="admin-kpi-val" style={{ color: "#38bdf8" }}>
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

        {/* COURT TIMELINES (CANCHA 1 VS CANCHA 2) */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 19, color: "#ffffff", fontWeight: 600, marginBottom: 16 }}>
            Grilla Horaria de Pistas ({activeDate})
          </h2>

          <div className="admin-courts-timeline-grid">
            {COURTS.map((court) => {
              const courtSlots = dayData?.slots?.filter((s) => s.courtId === court.id) || [];
              return (
                <div key={court.id} className="admin-court-col">
                  <div className="admin-court-col-header">
                    <div>
                      <strong style={{ fontSize: 16, color: "#ffffff" }}>{court.name}</strong>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
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

                      return (
                        <div
                          key={slot.slotKey}
                          className={`admin-timeline-slot${isTaken ? " occupied" : " free"}`}
                        >
                          <div className="admin-slot-time-col">
                            <strong>{slot.start}</strong>
                            <span>{slot.end}</span>
                          </div>

                          <div className="admin-slot-info-col">
                            {isTaken && b ? (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div>
                                    <strong style={{ fontSize: 14, color: "#ffffff" }}>
                                      {b.playerName}
                                    </strong>
                                    {b.playerPhone && (
                                      <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "block" }}>
                                        📞 {b.playerPhone}
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`badge-linear ${
                                      b.status === "pagado"
                                        ? "badge-emerald"
                                        : b.status === "señado"
                                        ? "badge-amber"
                                        : "badge-indigo"
                                    }`}
                                    style={{ fontSize: 10 }}
                                  >
                                    {b.status.toUpperCase()}
                                  </span>
                                </div>

                                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                                  {b.playerPhone && (
                                    <a
                                      href={`https://wa.me/${b.playerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                        `Hola ${b.playerName}! Te escribimos de Muzzaga Pádel por tu turno del ${activeDate} a las ${slot.start} hs en ${court.name}. ¿Todo bien?`,
                                      )}`}
                                      target="_blank"
                                      rel="noopener"
                                      className="admin-mini-btn whatsapp"
                                      title="Escribir por WhatsApp"
                                    >
                                      💬 WhatsApp
                                    </a>
                                  )}

                                  <select
                                    className="admin-mini-select"
                                    value={b.status}
                                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                  >
                                    <option value="confirmado">Confirmado</option>
                                    <option value="señado">Señado ($30.000)</option>
                                    <option value="pagado">Pagado Total</option>
                                  </select>

                                  <button
                                    type="button"
                                    className="admin-mini-btn cancel"
                                    onClick={() => handleCancel(b.id, court.id, slot.start)}
                                    title="Cancelar turno y liberar horario"
                                  >
                                    ✕ Liberar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                  ⚪ Horario Disponible
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{ height: 28, padding: "2px 10px", fontSize: 11 }}
                                  onClick={() => openCreateModal(court.id, slot.start)}
                                >
                                  + Asignar
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 19, color: "#ffffff", fontWeight: 600, margin: 0 }}>
              Listado de Reservas del Día ({filteredBookings.length})
            </h2>

            <input
              type="text"
              placeholder="🔍 Buscar por nombre, teléfono o código..."
              className="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                        <code style={{ color: "#38bdf8", fontWeight: 600 }}>{b.bookingCode}</code>
                      </td>
                      <td>{b.courtName}</td>
                      <td>
                        <strong>{b.startTime}</strong> - {b.endTime} hs
                      </td>
                      <td>
                        <strong>{b.playerName}</strong>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {b.playerPhone || "-"}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>
                          ${(typeof b.total === "number"
                            ? b.total
                            : (b.fullCourt !== false
                              ? priceForSlot(b.date || activeDate, b.startTime).total
                              : (b.playersCount || 4) * priceForSlot(b.date || activeDate, b.startTime).perPlayer)
                          ).toLocaleString("es-AR")}
                        </strong>
                      </td>
                      <td>
                        <select
                          className="admin-mini-select"
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        >
                          <option value="confirmado">Confirmado</option>
                          <option value="señado">Señado</option>
                          <option value="pagado">Pagado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {b.playerPhone && (
                            <a
                              href={`https://wa.me/${b.playerPhone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener"
                              className="admin-table-action-btn"
                              title="Chat WhatsApp"
                            >
                              💬
                            </a>
                          )}
                          <button
                            type="button"
                            className="admin-table-action-btn delete"
                            onClick={() => handleCancel(b.id, b.courtId, b.startTime)}
                            title="Cancelar reserva"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No hay reservas registradas para esta fecha o criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL PARA CREAR RESERVA MANUAL O BLOQUEO */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, color: "#ffffff", margin: 0 }}>
                ➕ Cargar Turno Manual / Bloquear
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="admin-field-label">Cancha:</label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.courtId}
                    onChange={(e) => setModalForm({ ...modalForm, courtId: e.target.value })}
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
                    onChange={(e) => setModalForm({ ...modalForm, startTime: e.target.value })}
                  >
                    {["14:00", "15:30", "17:00", "18:30", "20:00", "21:30", "23:00"].map((t) => (
                      <option key={t} value={t}>
                        {t} hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="admin-field-label">Nombre del Jugador o Motivo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez (o 'Clase Profe Nico')"
                  className="admin-input-field"
                  value={modalForm.playerName}
                  onChange={(e) => setModalForm({ ...modalForm, playerName: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="admin-field-label">Teléfono de Contacto:</label>
                  <input
                    type="tel"
                    placeholder="Ej. 299 597 4176"
                    className="admin-input-field"
                    value={modalForm.playerPhone}
                    onChange={(e) => setModalForm({ ...modalForm, playerPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-field-label">Estado Inicial:</label>
                  <select
                    className="admin-modal-select"
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="señado">Señado</option>
                    <option value="pagado">Pagado Total</option>
                    <option value="bloqueado">Bloqueado / Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="admin-field-label">Notas u Observaciones (opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. Pidió 4 cervezas Heineken"
                  className="admin-input-field"
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-linear-primary"
                style={{ width: "100%", height: 44, justifyContent: "center" }}
                disabled={modalSubmitting}
              >
                {modalSubmitting ? "Guardando..." : "Confirmar y Guardar Turno →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
