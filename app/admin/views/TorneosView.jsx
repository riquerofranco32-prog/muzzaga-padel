"use client";

import { useEffect, useState } from "react";
import { formatARS, plural } from "../../../lib/format";
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
import { IconPlus, IconTrash, WhatsAppMiniIcon } from "../adminHelpers";

const STATUS_LABELS = {
  abierto: { label: "Inscripciones Abiertas", tone: "badge-emerald" },
  cerrado: { label: "Inscripciones Cerradas", tone: "badge-amber" },
  finalizado: { label: "Finalizado", tone: "badge-indigo" },
};

const EMPTY_TOURNAMENT_FORM = { name: "", date: "", category: "", price: "" };
const EMPTY_PLAYER_FORM = { name: "", phone: "", partner: "" };

export default function TorneosView({ onExpiredSession }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_TOURNAMENT_FORM);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [playerForm, setPlayerForm] = useState(EMPTY_PLAYER_FORM);
  const [addingPlayer, setAddingPlayer] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    setLoading(true);
    const res = await adminGetTournaments();
    setLoading(false);
    if (res.ok) {
      setTournaments(res.tournaments || []);
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
      setCreateForm(EMPTY_TOURNAMENT_FORM);
      setShowCreateForm(false);
      loadTournaments();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo crear el torneo.");
    }
  }

  async function handleDeleteTournament(id) {
    if (!confirm("¿Eliminar este torneo y todos sus inscriptos?")) return;
    const res = await adminDeleteTournament(id);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) alert(res.error);
  }

  async function handleStatusChange(id, status) {
    const res = await adminUpdateTournamentStatus(id, status);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) alert(res.error);
  }

  async function handleAddPlayer(e, tournamentId) {
    e.preventDefault();
    setAddingPlayer(true);
    const res = await adminAddTournamentPlayer(tournamentId, playerForm);
    setAddingPlayer(false);
    if (res.ok) {
      setPlayerForm(EMPTY_PLAYER_FORM);
      loadTournaments();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo agregar el jugador.");
    }
  }

  async function handleTogglePaid(tournamentId, playerId, paid) {
    const res = await adminTogglePlayerPaid(tournamentId, playerId, !paid);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) alert(res.error);
  }

  async function handleRemovePlayer(tournamentId, playerId) {
    if (!confirm("¿Quitar a este jugador del torneo?")) return;
    const res = await adminRemoveTournamentPlayer(tournamentId, playerId);
    if (res.ok) loadTournaments();
    else if (!onExpiredSession?.(res)) alert(res.error);
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
          Torneos
        </h2>
        <button
          type="button"
          className="btn btn-linear-primary"
          style={{ height: 36, padding: "6px 14px", fontSize: 13 }}
          onClick={() => setShowCreateForm((v) => !v)}
        >
          <IconPlus /> Nuevo Torneo
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="admin-tournament-card"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label className="admin-field-label">Nombre del torneo</label>
            <input
              type="text"
              required
              className="admin-input-field"
              placeholder="Ej. Torneo Primavera 2026"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="admin-field-label">Fecha</label>
            <input
              type="date"
              className="admin-input-field"
              value={createForm.date}
              onChange={(e) =>
                setCreateForm({ ...createForm, date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="admin-field-label">Categoría</label>
            <input
              type="text"
              className="admin-input-field"
              placeholder="Ej. 6ta Libre"
              value={createForm.category}
              onChange={(e) =>
                setCreateForm({ ...createForm, category: e.target.value })
              }
            />
          </div>
          <div>
            <label className="admin-field-label">
              Precio de inscripción (por pareja)
            </label>
            <input
              type="number"
              min="0"
              className="admin-input-field"
              placeholder="0"
              value={createForm.price}
              onChange={(e) =>
                setCreateForm({ ...createForm, price: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="btn btn-linear-primary"
            style={{
              gridColumn: "1 / -1",
              height: 40,
              justifyContent: "center",
            }}
            disabled={creating}
          >
            {creating ? "Creando..." : "Crear Torneo"}
          </button>
        </form>
      )}

      <div className={loading ? "admin-content-loading" : ""}>
        {tournaments.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Todavía no cargaste ningún torneo.
          </p>
        ) : (
          tournaments.map((t) => {
            const isOpen = expandedId === t.id;
            const paidCount = t.players.filter((p) => p.paid).length;
            const statusInfo = STATUS_LABELS[t.status] || STATUS_LABELS.abierto;
            return (
              <div key={t.id} className="admin-tournament-card">
                <div
                  className="admin-tournament-header"
                  onClick={() => setExpandedId(isOpen ? null : t.id)}
                >
                  <div>
                    <strong style={{ fontSize: 16, color: "var(--color-ink)" }}>
                      {t.name}
                    </strong>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {t.date || "Sin fecha"} · {t.category || "Sin categoría"}{" "}
                      · {plural(t.players.length, "inscripto", "inscriptos")} (
                      {plural(paidCount, "pagado", "pagados")})
                      {t.price > 0 && ` · ${formatARS(t.price)} por pareja`}
                    </div>
                  </div>
                  <span className={`badge-linear ${statusInfo.tone}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {isOpen && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid var(--color-hairline)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <select
                        className="admin-mini-select"
                        value={t.status}
                        onChange={(e) =>
                          handleStatusChange(t.id, e.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([val, info]) => (
                          <option key={val} value={val}>
                            {info.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="admin-table-action-btn delete"
                        onClick={() => handleDeleteTournament(t.id)}
                      >
                        <IconTrash size={12} /> Eliminar Torneo
                      </button>
                    </div>

                    {t.players.map((p) => (
                      <div key={p.id} className="admin-player-row">
                        <div>
                          <strong>{p.name}</strong>
                          {p.partner && (
                            <span style={{ color: "var(--text-muted)" }}>
                              {" "}
                              / {p.partner}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {p.phone && (
                            <a
                              href={`https://wa.me/${toWhatsappNumber(p.phone)}`}
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
                            className={`admin-player-paid-toggle ${p.paid ? "paid" : "unpaid"}`}
                            onClick={() => handleTogglePaid(t.id, p.id, p.paid)}
                          >
                            {p.paid ? "Pagado" : "Pendiente"}
                          </button>
                          <button
                            type="button"
                            className="admin-table-action-btn delete"
                            onClick={() => handleRemovePlayer(t.id, p.id)}
                            title="Quitar jugador"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <form
                      onSubmit={(e) => handleAddPlayer(e, t.id)}
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 10,
                        alignItems: "flex-end",
                      }}
                    >
                      <div>
                        <label className="admin-field-label">Jugador</label>
                        <input
                          type="text"
                          required
                          className="admin-input-field"
                          style={{ width: 160 }}
                          value={playerForm.name}
                          onChange={(e) =>
                            setPlayerForm({
                              ...playerForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">Pareja</label>
                        <input
                          type="text"
                          className="admin-input-field"
                          style={{ width: 160 }}
                          value={playerForm.partner}
                          onChange={(e) =>
                            setPlayerForm({
                              ...playerForm,
                              partner: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">Teléfono</label>
                        <input
                          type="tel"
                          className="admin-input-field"
                          style={{ width: 140 }}
                          value={playerForm.phone}
                          onChange={(e) =>
                            setPlayerForm({
                              ...playerForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-secondary"
                        style={{ height: 38, fontSize: 12.5 }}
                        disabled={addingPlayer}
                      >
                        {addingPlayer ? "Agregando..." : "+ Agregar"}
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
