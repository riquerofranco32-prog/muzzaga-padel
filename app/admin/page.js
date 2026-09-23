"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Search, Tv } from "lucide-react";
import {
  adminAddPayment,
  adminCancelBooking,
  adminCreateManualBooking,
  adminGetClients,
  adminGetClubConfig,
  adminSetTestFlag,
  adminGetWeekStats,
  adminLogout,
  adminRemovePayment,
  adminUpdateStatus,
  checkAdminSession,
  getAdminDayData,
  verifyAdminPassword,
} from "./actions";
import {
  COURTS,
  SLOT_DURATION_MIN,
  addMinutes,
  nowInClubTimezone,
  todayInClub,
} from "../../lib/booking";
import { getClubStatus } from "../../data/horarios";
import { formatARS, formatDate, formatPct, formatTime } from "../../lib/format";
import { IconAlert, IconPlus, isExpiredSessionError } from "./adminHelpers";
import AgendaView from "./views/AgendaView";
import ClientesView from "./views/ClientesView";
import CalendarioView from "./views/CalendarioView";
import ReportesView from "./views/ReportesView";
import CantinaView from "./views/CantinaView";
import TorneosView from "./views/TorneosView";
import CajaView from "./views/CajaView";
import ConfiguracionView from "./views/ConfiguracionView";
import CreateBookingModal from "./CreateBookingModal";
import BookingDetailModal from "./BookingDetailModal";
import { ICON_PROPS, NAV_ITEMS, findNavItem } from "./nav";
import { Toaster, useToasts } from "./ui/Toaster";
import CommandPalette from "./ui/CommandPalette";
import MobileNav from "./ui/MobileNav";

const CLUB_PILL_CLASS = {
  abierto: "is-open",
  "cierra-pronto": "is-closing",
  cerrado: "is-closed",
  bloqueado: "is-closed",
};

/** El foco está en un campo editable: los atajos de una letra no aplican. */
function isTypingTarget(el) {
  return Boolean(
    el &&
    (el.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)),
  );
}

function greetingWord() {
  const h = Number(nowInClubTimezone().hhmm.slice(0, 2));
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Vista activa del sidebar
  const [view, setView] = useState("agenda");

  // Dashboard Data State (Agenda)
  const [activeDate, setActiveDate] = useState(todayInClub);
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal de creación de turno
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

  // Clientes (derivados de reservas), compartido con el autocompletar del
  // modal de creación.
  const [clients, setClients] = useState([]);

  // Tendencia de los últimos 7 días (KPIs con flecha hoy-vs-ayer + gráfico)
  const [weekStats, setWeekStats] = useState(null);
  const [lastWeekSameDay, setLastWeekSameDay] = useState(null);
  const [nowLabel, setNowLabel] = useState("");

  // Días bloqueados de Configuración: el estado del club los respeta.
  const [blockedDates, setBlockedDates] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  // Detalle de turno: cobros parciales, saldo pendiente, cancelar
  const [detailBooking, setDetailBooking] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: "efectivo",
    amount: "",
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const { toasts, show: showToast, dismiss: dismissToast } = useToasts();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  // Búsqueda que llega desde el command palette a Clientes. La key fuerza a
  // la vista a arrancar con esa búsqueda aunque ya estuviera montada.
  const [clientesSearch, setClientesSearch] = useState({ query: "", key: 0 });

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

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDayData(activeDate);
  }, [isAuthenticated, activeDate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadClients();
    loadWeekStats();
    adminGetClubConfig().then((res) => {
      if (res.ok) setBlockedDates(res.config.blockedDates || []);
    });
  }, [isAuthenticated]);

  // Solo se avisa cuando se PIERDE la conexión: si todo anda, no hay badge.
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Reloj del saludo del header: se actualiza solo, no hace falta refrescar
  // la página para que dejen de mostrar la hora con la que se logueó el admin.
  useEffect(() => {
    if (!isAuthenticated) return;
    const update = () => setNowLabel(formatTime());
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  // Atajos: Ctrl/⌘+K abre el buscador, N abre "Nueva reserva".
  useEffect(() => {
    if (!isAuthenticated) return;
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((open) => !open);
        return;
      }
      if (e.key === "Escape" && !isPaletteOpen) {
        if (detailBooking) setDetailBooking(null);
        else if (isModalOpen) setIsModalOpen(false);
        return;
      }
      const isBusy = isModalOpen || isPaletteOpen || detailBooking;
      if (
        e.key.toLowerCase() === "n" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isBusy &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        openCreateModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAuthenticated, isModalOpen, isPaletteOpen, detailBooking]);

  // Si el modal de detalle está abierto y llega dayData nuevo (por ej. tras
  // registrar un cobro), lo refrescamos para que el saldo no quede viejo.
  useEffect(() => {
    if (!detailBooking || !dayData) return;
    const fresh = dayData.bookings.find((b) => b.id === detailBooking.id);
    if (fresh) setDetailBooking(fresh);
  }, [dayData]);

  /**
   * Si la cookie venció mientras el panel estaba abierto, los actions
   * devuelven el error de sesión: en ese caso volvemos al login en vez de
   * dejar la pantalla con datos viejos y botones que no hacen nada. Se pasa
   * como prop a las vistas independientes (Calendario/Reportes/Cantina/
   * Torneos) para que también puedan reaccionar a una sesión caída.
   * @returns {boolean} true si la sesión se cayó y ya se manejó.
   */
  function handleExpiredSession(res) {
    if (res?.ok || !isExpiredSessionError(res)) return false;
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
      showToast(res.error || "No se pudieron cargar los datos del día.", {
        tone: "error",
      });
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

  function showError(res, fallback) {
    if (!handleExpiredSession(res)) {
      showToast(res?.error || fallback, { tone: "error" });
    }
  }

  function refreshMoney() {
    loadDayData(activeDate);
    loadWeekStats();
  }

  async function handleStatusChange(
    bookingId,
    newStatus,
    { isUndo = false } = {},
  ) {
    const previous = dayData?.bookings.find((b) => b.id === bookingId)?.status;
    const res = await adminUpdateStatus(bookingId, newStatus);
    if (!res.ok) return showError(res, "No se pudo actualizar el estado.");
    refreshMoney();
    const canUndo = !isUndo && previous && previous !== newStatus;
    showToast(isUndo ? "Cambio deshecho" : "Estado actualizado", {
      action: canUndo
        ? {
            label: "Deshacer",
            onClick: () =>
              handleStatusChange(bookingId, previous, { isUndo: true }),
          }
        : undefined,
    });
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
    if (!res.ok) return showError(res, "No se pudo cancelar el turno.");
    refreshMoney();
    showToast(`Turno de las ${startTime} cancelado · horario liberado`);
  }

  async function loadClients() {
    const res = await adminGetClients();
    if (res.ok) setClients(res.clients || []);
  }

  async function loadWeekStats() {
    const res = await adminGetWeekStats();
    if (res.ok) {
      setWeekStats(res.days);
      setLastWeekSameDay(res.lastWeekSameDay);
    }
  }

  async function handleToggleTest(booking) {
    const res = await adminSetTestFlag("bookings", booking.id, !booking.isTest);
    if (!res.ok) return showError(res, "No se pudo actualizar el turno.");
    refreshMoney();
    loadClients();
    showToast(
      booking.isTest
        ? "El turno vuelve a contar como real"
        : "Marcado como dato de prueba · ya no suma en totales",
    );
  }

  function openDetail(booking) {
    setPaymentForm({ method: "efectivo", amount: "" });
    setDetailBooking(booking);
  }

  async function handleAddPayment(e) {
    e.preventDefault();
    if (!detailBooking) return;
    setPaymentSubmitting(true);
    const res = await adminAddPayment(
      detailBooking.id,
      paymentForm.method,
      paymentForm.amount,
    );
    setPaymentSubmitting(false);
    if (!res.ok) return showError(res, "No se pudo registrar el cobro.");
    const bookingId = detailBooking.id;
    setPaymentForm({ method: paymentForm.method, amount: "" });
    refreshMoney();
    showToast(`Cobro registrado · ${formatARS(paymentForm.amount)}`, {
      action: {
        label: "Deshacer",
        onClick: async () => {
          const undo = await adminRemovePayment(bookingId, res.paymentId);
          if (!undo.ok) return showError(undo, "No se pudo deshacer el cobro.");
          refreshMoney();
          showToast("Cobro deshecho");
        },
      },
    });
  }

  async function handleRemovePayment(paymentId) {
    if (!detailBooking || !confirm("¿Eliminar este cobro?")) return;
    const res = await adminRemovePayment(detailBooking.id, paymentId);
    if (!res.ok) return showError(res, "No se pudo eliminar el cobro.");
    refreshMoney();
    showToast("Cobro eliminado");
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
    if (!res.ok) return showError(res, "No se pudo crear la reserva.");
    setIsModalOpen(false);
    refreshMoney();
    loadClients();
    showToast(
      `Reserva creada · ${modalForm.playerName.trim() || "Reserva manual"} · ${modalForm.startTime}`,
    );
  }

  /** Autocompletar teléfono si el nombre tipeado coincide con un cliente ya cargado. */
  function handlePlayerNameBlur() {
    const typed = modalForm.playerName.trim().toLowerCase();
    if (!typed || modalForm.playerPhone) return;
    const match = clients.find((c) => c.name.toLowerCase() === typed);
    if (match?.phone) {
      setModalForm((f) => ({ ...f, playerPhone: match.phone }));
    }
  }

  function copyDaySchedule() {
    if (!dayData) return;
    let text = `📋 *PLANILLA DE TURNOS - MUZZAGA PÁDEL*\n`;
    text += `📅 *Fecha:* ${dayData.date}\n`;
    text += `🎾 *Ocupación:* ${dayData.stats.takenSlots}/${dayData.stats.totalSlots} turnos (${formatPct(dayData.stats.ocupacionPct)})\n\n`;

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

    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Planilla del día copiada para WhatsApp"))
      .catch(() =>
        showToast("No se pudo copiar la planilla.", { tone: "error" }),
      );
  }

  function navigate(id) {
    setView(id);
    window.scrollTo({ top: 0 });
  }

  function openClientFromPalette(client) {
    setClientesSearch((prev) => ({ query: client.name, key: prev.key + 1 }));
    navigate("clientes");
  }

  function handleSelectCalendarDate(date) {
    setActiveDate(date);
    setView("agenda");
  }

  const clubStatus = getClubStatus(new Date(), { blockedDates });

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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 16,
                marginBottom: 12,
              }}
            >
              <img
                src="/img/logo_badge.png"
                alt="Muzzaga Pádel"
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                }}
              />
              <img
                src="/img/mascotas/muzzaguito-lentes-paleta.webp"
                alt="Muzzaguito Staff Admin"
                width={76}
                height={76}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.3))",
                }}
              />
            </div>
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

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-shell">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <img
              src="/img/logo_badge.png"
              alt="Muzzaga"
              width={30}
              height={30}
              style={{
                width: 30,
                height: 30,
                objectFit: "contain",
                display: "block",
              }}
            />
            <div>
              <strong>Muzzaga Admin</strong>
              <span>Catriel, Río Negro</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`admin-sidebar-link${view === id ? " active" : ""}`}
                aria-current={view === id ? "page" : undefined}
                onClick={() => navigate(id)}
              >
                <Icon {...ICON_PROPS} />
                {label}
              </button>
            ))}
          </nav>

          <div
            style={{
              margin: "14px 12px 6px",
              padding: "10px 12px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src="/img/mascotas/muzzaguito-lentes-paleta.webp"
              alt="Muzzaguito Staff"
              width={54}
              height={54}
              style={{ objectFit: "contain", flexShrink: 0 }}
            />
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.25,
              }}
            >
              <strong
                style={{ color: "var(--text-primary)", display: "block" }}
              >
                Staff Muzzaga
              </strong>
              Panel de Control
            </div>
          </div>

          <div className="admin-sidebar-footer">
            <Link
              href="/admin/monitor"
              target="_blank"
              className="admin-sidebar-link"
            >
              <Tv {...ICON_PROPS} /> Monitor TV Pistas
            </Link>
            <Link href="/" target="_blank" className="admin-sidebar-link">
              <ExternalLink {...ICON_PROPS} /> Ver Web
            </Link>
            <button
              type="button"
              className="admin-sidebar-link"
              onClick={handleLogout}
            >
              <LogOut {...ICON_PROPS} /> Salir
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="admin-main">
          <div className="admin-main-inner">
            <header className="admin-main-header">
              <div>
                {/* El saludo solo en Agenda; el resto muestra el título de la sección. */}
                <h1 className="admin-page-title">
                  {view === "agenda"
                    ? `${greetingWord()}, Muzzaga`
                    : findNavItem(view).label}
                </h1>
                <div className="admin-greeting-sub">
                  <span>
                    {formatDate(todayInClub(), "long")} · {nowLabel}
                  </span>
                  <span
                    className={`admin-live-pill ${CLUB_PILL_CLASS[clubStatus.state]}`}
                  >
                    {clubStatus.statusText}
                  </span>
                  {!isOnline ? (
                    <span className="admin-live-pill is-offline" role="status">
                      <IconAlert size={12} /> Sin conexión — lo que cargues
                      ahora no se va a guardar
                    </span>
                  ) : (
                    dayData?.firebaseOk === false && (
                      <span
                        className="admin-live-pill is-offline"
                        role="status"
                      >
                        <IconAlert size={12} /> No se pudo leer la base — los
                        datos pueden no estar actualizados
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="admin-quick-actions">
                <button
                  type="button"
                  className="btn btn-secondary admin-palette-trigger"
                  onClick={() => setIsPaletteOpen(true)}
                  aria-label="Buscar (Ctrl + K)"
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Search {...ICON_PROPS} />
                    <span className="admin-palette-label">Buscar…</span>
                  </span>
                  <kbd className="admin-kbd">Ctrl K</kbd>
                </button>
                {view === "agenda" && (
                  <button
                    type="button"
                    onClick={copyDaySchedule}
                    className="btn btn-secondary"
                  >
                    Copiar planilla
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openCreateModal()}
                  className="btn btn-linear-primary admin-cta-new"
                  title="Nueva reserva (N)"
                >
                  <IconPlus /> Nueva Reserva <kbd className="admin-kbd">N</kbd>
                </button>
              </div>
            </header>

            {view === "agenda" && (
              <AgendaView
                activeDate={activeDate}
                setActiveDate={setActiveDate}
                dayData={dayData}
                loading={loading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                weekStats={weekStats}
                lastWeekSameDay={lastWeekSameDay}
                onGoToCaja={() => navigate("caja")}
                onRefresh={() => loadDayData(activeDate)}
                onOpenCreate={openCreateModal}
                onOpenDetail={openDetail}
                onStatusChange={handleStatusChange}
                onCancel={handleCancel}
              />
            )}
            {view === "calendario" && (
              <CalendarioView
                onSelectDate={handleSelectCalendarDate}
                onExpiredSession={handleExpiredSession}
              />
            )}
            {view === "clientes" && (
              <ClientesView
                key={clientesSearch.key}
                clients={clients}
                initialSearch={clientesSearch.query}
              />
            )}
            {view === "caja" && (
              <CajaView
                initialDate={activeDate}
                onExpiredSession={handleExpiredSession}
                onToast={showToast}
              />
            )}
            {view === "cantina" && (
              <CantinaView
                onExpiredSession={handleExpiredSession}
                onToast={showToast}
              />
            )}
            {view === "torneos" && (
              <TorneosView onExpiredSession={handleExpiredSession} />
            )}
            {view === "reportes" && (
              <ReportesView onExpiredSession={handleExpiredSession} />
            )}
            {view === "configuracion" && (
              <ConfiguracionView onExpiredSession={handleExpiredSession} />
            )}
          </div>
        </main>
      </div>

      <MobileNav
        view={view}
        onNavigate={navigate}
        onNewBooking={() => openCreateModal()}
        onLogout={handleLogout}
      />

      {isPaletteOpen && (
        <CommandPalette
          clients={clients}
          onClose={() => setIsPaletteOpen(false)}
          onNavigate={navigate}
          onNewBooking={() => openCreateModal()}
          onOpenClient={openClientFromPalette}
        />
      )}

      <Toaster toasts={toasts} onDismiss={dismissToast} />

      {/* MODAL PARA CREAR RESERVA MANUAL O BLOQUEO */}
      {isModalOpen && (
        <CreateBookingModal
          activeDate={activeDate}
          modalForm={modalForm}
          setModalForm={setModalForm}
          modalSubmitting={modalSubmitting}
          clients={clients}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateSubmit}
          onPlayerNameBlur={handlePlayerNameBlur}
        />
      )}

      {/* MODAL DE DETALLE: cobros parciales, saldo pendiente, cancelar */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          clients={clients}
          paymentForm={paymentForm}
          setPaymentForm={setPaymentForm}
          paymentSubmitting={paymentSubmitting}
          onClose={() => setDetailBooking(null)}
          onAddPayment={handleAddPayment}
          onRemovePayment={handleRemovePayment}
          onCancel={handleCancel}
          onToggleTest={handleToggleTest}
          onMoved={() => {
            loadDayData(activeDate);
            setDetailBooking(null);
          }}
        />
      )}
    </div>
  );
}
