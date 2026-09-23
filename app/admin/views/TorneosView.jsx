"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, DollarSign, Search, Plus, Trash2, Calendar, Phone, CheckCircle, Clock } from "lucide-react";
import { EmptyState, SkeletonRows } from "../ui/states";
import { formatARS, plural, normalizeSearch } from "../../../lib/format";
import {
  adminAddTournamentPlayer,
  adminCreateTournament,
  adminDeleteTournament,
  adminGetTournaments,
  adminRemoveTournamentPlayer,
  adminTogglePlayerPaid,
  adminUpdateTournamentStatus,
} from "../actions";
import { toWhatsappNumber } from "../../../lib/phone";
import { WhatsAppMiniIcon } from "../adminHelpers";

const STATUS_LABELS = {
  abierto: { label: "Inscripciones Abiertas", tone: "badge-emerald" },
  cerrado: { label: "Inscripciones Cerradas", tone: "badge-amber" },
  finalizado: { label: "Finalizado", tone: "badge-indigo" },
};

const EMPTY_TOURNAMENT_FORM = { name: "", date: "", category: "", price: "" };
const EMPTY_PLAYER_FORM = { name: "", phone: "", partner: "" };

const toastError = (onToast, res, fallback) =>
  onToast?.(res?.error || fallback, { tone: "error" });

const getInitials = (name) => {
  if (!name) return "TP";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
};

export default function TorneosView({ onExpiredSession, onToast }) {
  const [tournaments, setTournaments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_TOURNAMENT_FORM);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [playerForm, setPlayerForm] = useState(EMPTY_PLAYER_FORM);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    setLoading(true);
    const res = await adminGetTournaments();
    setLoading(false);
    if (res.ok) {
      setTournaments(res.tournaments || []);
      // Auto-expand first tournament if none expanded
      if (res.tournaments?.length && !expandedId) {
        setExpandedId(res.tournaments[0].id);
      }
    } else if (onExpiredSession) {
      onExpiredSession(res);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    const res = await adminCreateTournament(createForm);
    setCreating(false);
    if (res.ok) {
      onToast?.(`Torneo creado · ${createForm.name.trim()}`);
      setCreateForm(EMPTY_TOURNAMENT_FORM);
      setShowCreateForm(false);
      loadTournaments();
    } else if (!onExpiredSession?.(res)) {
      toastError(onToast, res, "No se pudo crear el torneo.");
    }
  }

  async function handleDeleteTournament(id) {
    if (!confirm("¿Eliminar este torneo y todos sus inscriptos?")) return;
    const res = await adminDeleteTournament(id);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) toastError(onToast, res, "No se pudo actualizar el torneo.");
  }

  async function handleStatusChange(id, status) {
    const res = await adminUpdateTournamentStatus(id, status);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) toastError(onToast, res, "No se pudo actualizar el torneo.");
  }

  async function handleAddPlayer(e, tournamentId) {
    e.preventDefault();
    setAddingPlayer(true);
    const res = await adminAddTournamentPlayer(tournamentId, playerForm);
    setAddingPlayer(false);
    if (res.ok) {
      onToast?.(`Inscripto · ${playerForm.name.trim()}`);
      setPlayerForm(EMPTY_PLAYER_FORM);
      loadTournaments();
    } else if (!onExpiredSession?.(res)) {
      toastError(onToast, res, "No se pudo agregar el jugador.");
    }
  }

  async function handleTogglePaid(tournamentId, playerId, paid) {
    const res = await adminTogglePlayerPaid(tournamentId, playerId, !paid);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) toastError(onToast, res, "No se pudo actualizar el torneo.");
  }

  async function handleRemovePlayer(tournamentId, playerId) {
    if (!confirm("¿Quitar a este jugador del torneo?")) return;
    const res = await adminRemoveTournamentPlayer(tournamentId, playerId);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) toastError(onToast, res, "No se pudo actualizar el torneo.");
  }

  // Métricas agregadas
  const metrics = useMemo(() => {
    const list = tournaments || [];
    const openTournaments = list.filter((t) => t.status === "abierto").length;
    const totalPairs = list.reduce((sum, t) => sum + (t.players?.length || 0), 0);
    const paidPairs = list.reduce(
      (sum, t) => sum + (t.players?.filter((p) => p.paid)?.length || 0),
      0
    );
    const totalCollected = list.reduce(
      (sum, t) =>
        sum +
        (t.players?.filter((p) => p.paid)?.length || 0) * (Number(t.price) || 0),
      0
    );
    const totalPending = list.reduce(
      (sum, t) =>
        sum +
        (t.players?.filter((p) => !p.paid)?.length || 0) * (Number(t.price) || 0),
      0
    );
    return { openTournaments, totalPairs, paidPairs, totalCollected, totalPending };
  }, [tournaments]);

  // Torneos filtrados
  const filteredTournaments = useMemo(() => {
    let list = tournaments || [];
    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = normalizeSearch(search);
      list = list.filter(
        (t) =>
          normalizeSearch(t.name || "").includes(q) ||
          normalizeSearch(t.category || "").includes(q) ||
          t.players?.some((p) =>
            normalizeSearch(`${p.name} ${p.partner || ""} ${p.phone || ""}`).includes(q)
          )
      );
    }
    return list;
  }, [tournaments, statusFilter, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 3 KPI CARDS KRAVIO PARA TORNEOS */}
      <div className="admin-kpis-3">
        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Torneos Activos</span>
            <Trophy size={17} style={{ color: "#ea580c" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#ea580c" }}>
                {metrics.openTournaments} {metrics.openTournaments === 1 ? "Abierto" : "Abiertos"}
              </div>
              <span className="admin-cell-sub">
                {tournaments ? `${tournaments.length} torneos registrados` : "Cargando..."}
              </span>
            </div>
            <div className="admin-kravio-sparkline">
              <svg viewBox="0 0 100 36">
                <path d="M 0,28 Q 20,24 40,16 T 80,10 T 100,6" fill="none" stroke="#ea580c" strokeWidth="2.5" />
                <path d="M 0,28 Q 20,24 40,16 T 80,10 T 100,6 L 100,36 L 0,36 Z" fill="rgba(234, 88, 12, 0.08)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Parejas Inscriptas</span>
            <Users size={17} style={{ color: "#15803d" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#15803d" }}>
                {metrics.totalPairs} {metrics.totalPairs === 1 ? "Pareja" : "Parejas"}
              </div>
              <span className="admin-cell-sub">
                {metrics.paidPairs} abonadas · {metrics.totalPairs - metrics.paidPairs} pendientes
              </span>
            </div>
            <div className="admin-kravio-sparkline">
              <svg viewBox="0 0 100 36">
                <path d="M 0,30 Q 25,28 50,15 T 85,8 T 100,4" fill="none" stroke="#15803d" strokeWidth="2.5" />
                <path d="M 0,30 Q 25,28 50,15 T 85,8 T 100,4 L 100,36 L 0,36 Z" fill="rgba(21, 128, 61, 0.08)" />
              </svg>
            </div>
          </div>
        </div>

        <div className="admin-kravio-kpi-card">
          <div className="admin-kravio-kpi-header">
            <span className="admin-kravio-kpi-title">Recaudación Inscripciones</span>
            <DollarSign size={17} style={{ color: "#0284c7" }} />
          </div>
          <div className="admin-kravio-kpi-content">
            <div className="admin-kravio-kpi-left">
              <div className="admin-kravio-kpi-number" style={{ color: "#0284c7" }}>
                {formatARS(metrics.totalCollected)}
              </div>
              <span className="admin-cell-sub">
                {metrics.totalPending > 0 ? `${formatARS(metrics.totalPending)} por cobrar` : "Todo al día"}
              </span>
            </div>
            <div className="admin-kravio-sparkline">
              <svg viewBox="0 0 100 36">
                <path d="M 0,26 Q 30,22 60,14 T 90,8 T 100,6" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                <path d="M 0,26 Q 30,22 60,14 T 90,8 T 100,6 L 100,36 L 0,36 Z" fill="rgba(2, 132, 199, 0.08)" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR CON SEGMENTOS Y BOTÓN DE NUEVO TORNEO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div className="admin-segmented" role="group" aria-label="Filtro de torneos">
            <button
              type="button"
              aria-pressed={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              Todos ({tournaments?.length || 0})
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "abierto"}
              onClick={() => setStatusFilter("abierto")}
            >
              Abiertos ({tournaments?.filter((t) => t.status === "abierto").length || 0})
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "cerrado"}
              onClick={() => setStatusFilter("cerrado")}
            >
              Cerrados
            </button>
            <button
              type="button"
              aria-pressed={statusFilter === "finalizado"}
              onClick={() => setStatusFilter("finalizado")}
            >
              Finalizados
            </button>
          </div>

          <div className="admin-input-icon" style={{ minWidth: 220 }}>
            <Search size={15} aria-hidden />
            <input
              type="search"
              aria-label="Buscar torneos o parejas"
              placeholder="Buscar torneo o jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: 34, fontSize: 13 }}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-linear-primary"
          onClick={() => setShowCreateForm((v) => !v)}
          aria-expanded={showCreateForm}
        >
          <Plus size={16} /> Nuevo Torneo
        </button>
      </div>

      {/* FORMULARIO CREAR TORNEO */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="admin-kravio-table-card"
          style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
            <strong style={{ fontSize: 15, color: "var(--color-ink)" }}>Nuevo Torneo o Americano</strong>
            <p className="admin-cell-sub" style={{ marginTop: 2 }}>
              Configurá la categoría, fecha y el arancel por pareja para comenzar a inscribir.
            </p>
          </div>
          <div>
            <label className="admin-field-label">Nombre del torneo *</label>
            <input
              type="text"
              required
              className="admin-input-field"
              placeholder="Ej. Torneo Primavera 2026"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-field-label">Fecha del evento</label>
            <input
              type="date"
              className="admin-input-field"
              value={createForm.date}
              onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-field-label">Categoría</label>
            <input
              type="text"
              className="admin-input-field"
              placeholder="Ej. 6ta Libre / 7ma Caballeros"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-field-label">Precio inscripción (por pareja)</label>
            <input
              type="number"
              min="0"
              className="admin-input-field"
              placeholder="0"
              value={createForm.price}
              onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-linear-primary"
              disabled={creating}
            >
              {creating ? "Creando..." : "Crear Torneo"}
            </button>
          </div>
        </form>
      )}

      {/* LISTADO DE TORNEOS */}
      <div className={loading ? "admin-content-loading" : ""} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {!tournaments ? (
          <SkeletonRows count={3} height={72} />
        ) : filteredTournaments.length === 0 ? (
          <div className="admin-kravio-table-card" style={{ padding: 32 }}>
            <EmptyState
              icon={Trophy}
              title="No se encontraron torneos"
              text={
                tournaments.length === 0
                  ? "Todavía no cargaste ningún torneo. Creá uno para llevar la lista de parejas inscriptas."
                  : "No hay torneos que coincidan con el filtro seleccionado."
              }
              action={
                tournaments.length === 0
                  ? { label: "Nuevo torneo", onClick: () => setShowCreateForm(true) }
                  : undefined
              }
            />
          </div>
        ) : (
          filteredTournaments.map((t) => {
            const isOpen = expandedId === t.id;
            const paidCount = t.players?.filter((p) => p.paid).length || 0;
            const totalP = t.players?.length || 0;
            const statusInfo = STATUS_LABELS[t.status] || STATUS_LABELS.abierto;
            const totalIncome = paidCount * (Number(t.price) || 0);

            return (
              <div
                key={t.id}
                className="admin-kravio-table-card"
                style={{
                  border: isOpen ? "1px solid rgba(234, 88, 12, 0.4)" : undefined,
                  boxShadow: isOpen ? "0 4px 16px rgba(234, 88, 12, 0.06)" : undefined,
                  overflow: "hidden",
                }}
              >
                {/* CABECERA DEL TORNEO */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(isOpen ? null : t.id);
                    }
                  }}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isOpen ? "rgba(234, 88, 12, 0.02)" : "transparent",
                    borderBottom: isOpen ? "1px solid var(--border)" : "none",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: isOpen ? "rgba(234, 88, 12, 0.12)" : "var(--color-badge-bg)",
                        color: isOpen ? "#ea580c" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Trophy size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 16, color: "var(--color-ink)", display: "block" }}>
                        {t.name}
                      </strong>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "var(--text-muted)",
                          marginTop: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span>📅 {t.date || "Sin fecha fija"}</span>
                        <span>🏆 {t.category || "General"}</span>
                        <span>👥 {plural(totalP, "inscripto", "inscriptos")} ({paidCount} al día)</span>
                        {t.price > 0 && (
                          <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                            💰 {formatARS(t.price)} / pareja
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right", display: "none", mdDisplay: "block" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                        {formatARS(totalIncome)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>recaudado</div>
                    </div>

                    <span className={`badge-linear ${statusInfo.tone}`}>
                      {statusInfo.label}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* DETALLE Y LISTA DE INSCRIPTOS */}
                {isOpen && (
                  <div style={{ padding: "16px 20px" }} onClick={(e) => e.stopPropagation()}>
                    {/* CONTROLES DE ESTADO & BORRADO */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        flexWrap: "wrap",
                        gap: 10,
                        background: "var(--color-badge-bg)",
                        padding: "10px 14px",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                          Estado:
                        </span>
                        <select
                          className="admin-mini-select"
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, info]) => (
                            <option key={val} value={val}>
                              {info.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        className="admin-table-action-btn delete"
                        onClick={() => handleDeleteTournament(t.id)}
                        style={{ fontSize: 12 }}
                      >
                        <Trash2 size={13} /> Eliminar Torneo
                      </button>
                    </div>

                    {/* TABLA ESTILO KRAVIO SLA DE INSCRIPTOS */}
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                      <table className="admin-kravio-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 44 }}>#</th>
                            <th>Pareja Inscripta</th>
                            <th>Teléfono / Contacto</th>
                            <th>Estado Pago</th>
                            <th style={{ textAlign: "right" }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!t.players || t.players.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", padding: "28px 16px", color: "var(--text-muted)" }}>
                                Aún no hay parejas inscriptas en este torneo. Completá el formulario de abajo para sumar la primera.
                              </td>
                            </tr>
                          ) : (
                            t.players.map((p, idx) => (
                              <tr key={p.id}>
                                <td style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>
                                  #{idx + 1}
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div className="admin-avatar-initials">
                                      {getInitials(p.name)}
                                    </div>
                                    <div>
                                      <strong style={{ fontSize: 13.5, color: "var(--color-ink)", display: "block" }}>
                                        {p.name}
                                      </strong>
                                      {p.partner && (
                                        <span className="admin-cell-sub">
                                          Compañero: <strong>{p.partner}</strong>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  {p.phone ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ fontSize: 13 }}>{p.phone}</span>
                                      <a
                                        href={`https://wa.me/${toWhatsappNumber(p.phone)}`}
                                        target="_blank"
                                        rel="noopener"
                                        className="admin-table-action-btn"
                                        title="Enviar WhatsApp"
                                      >
                                        <WhatsAppMiniIcon />
                                      </a>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className={`admin-status-pill ${p.paid ? "green" : "red"}`}
                                    onClick={() => handleTogglePaid(t.id, p.id, p.paid)}
                                    title="Click para cambiar estado de pago"
                                    style={{ cursor: "pointer", border: "none" }}
                                  >
                                    <span className="admin-status-pill-dot" />
                                    {p.paid ? "Abonado" : "Pendiente"}
                                  </button>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="admin-table-action-btn delete"
                                    onClick={() => handleRemovePlayer(t.id, p.id)}
                                    title="Quitar jugador"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* FORMULARIO AGREGAR INSCRIPTO */}
                    <form
                      onSubmit={(e) => handleAddPlayer(e, t.id)}
                      style={{
                        background: "var(--color-badge-bg)",
                        padding: "14px 16px",
                        borderRadius: 8,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label className="admin-field-label">Jugador 1 *</label>
                        <input
                          type="text"
                          required
                          className="admin-input-field"
                          placeholder="Nombre y apellido"
                          value={playerForm.name}
                          onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label className="admin-field-label">Jugador 2 (Pareja)</label>
                        <input
                          type="text"
                          className="admin-input-field"
                          placeholder="Nombre compañero/a"
                          value={playerForm.partner}
                          onChange={(e) => setPlayerForm({ ...playerForm, partner: e.target.value })}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label className="admin-field-label">WhatsApp</label>
                        <input
                          type="tel"
                          className="admin-input-field"
                          placeholder="Ej. 11 2345 6789"
                          value={playerForm.phone}
                          onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-linear-primary"
                        style={{ height: 38 }}
                        disabled={addingPlayer}
                      >
                        <Plus size={15} /> {addingPlayer ? "Sumando..." : "Inscribir Pareja"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
