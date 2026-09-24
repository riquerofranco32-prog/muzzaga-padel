"use client";

import { useEffect, useState } from "react";
import {
  createOpenMatch,
  getOpenMatches,
  joinOpenMatch,
} from "../app/open-matches/actions";
import { PRECIO_POR_JUGADOR } from "../data/pricing";
import Portal from "./Portal";

const WHATSAPP = "5492995974176";

export default function CommunityMatchesSection() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("all");

  // Join Modal State
  const [joinModal, setJoinModal] = useState(null); // { matchId, slotIndex, match }
  const [joinName, setJoinName] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  // Create Modal State
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    category: "6ta Categoría (3.0 - 3.9)",
    courtName: "Cancha 1 · Cristal",
    date: "",
    time: "20:00 hs",
    desc: "Partido parejo de 6ta para sumar puntos y ritmo.",
    creatorName: "",
    creatorPhone: "",
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);
    const res = await getOpenMatches();
    setLoading(false);
    if (res.ok) {
      setMatches(res.matches);
    }
  }

  const filteredMatches = matches.filter((m) => {
    if (selectedCat === "all") return true;
    return m.category.toLowerCase().includes(selectedCat.toLowerCase());
  });

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!joinModal) return;
    setJoinSubmitting(true);
    const res = await joinOpenMatch(
      joinModal.matchId,
      joinModal.slotIndex,
      joinName,
      joinPhone,
    );
    setJoinSubmitting(false);
    if (res.ok) {
      setJoinModal(null);
      setJoinName("");
      setJoinPhone("");
      loadMatches();
      // Abrir WhatsApp con mensaje de confirmación
      const msg = `¡Hola Muzzaga! Me sumé como jugador a la Cancha Abierta de ${joinModal.match.category} para el ${joinModal.match.date} a las ${joinModal.match.time} a nombre de ${joinName}.`;
      window.open(
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    } else {
      alert(res.error || "Error al unirse");
    }
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setCreateSubmitting(true);
    const res = await createOpenMatch(createForm);
    setCreateSubmitting(false);
    if (res.ok) {
      setCreateModal(false);
      loadMatches();
      const msg = `¡Hola Muzzaga! Publiqué una nueva Cancha Abierta (${createForm.category}) para el ${createForm.date || "hoy"} a las ${createForm.time}. ¿Me ayudan a difundirla en el grupo del club?`;
      window.open(
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    } else {
      alert(res.error || "Error al publicar");
    }
  }

  return (
    <section id="canchas-abiertas" className="section-community">
      <div className="container">
        <div className="section-header-row" style={{ alignItems: "center" }}>
          <div>
            <span
              className="badge-linear badge-amber"
              style={{ marginBottom: 6 }}
            >
              En Vivo · Matchmaking &amp; Comunidad
            </span>
            <h2 className="section-title">Canchas Abiertas en Catriel</h2>
            <p className="section-desc">
              Sumate a partidos con lugares libres o publicá tu propia
              convocatoria. Jugá con rivales de tu mismo nivel.
            </p>
          </div>
          <div className="header-aside">
            <div className="mascot-section-badge">
              <img
                src="/img/mascotas/muzzaguito-pizza-good-vibes.webp"
                alt="Muzzaguito compartiendo pizza con la comunidad"
                width={720}
                height={612}
                loading="lazy"
                decoding="async"
                className="mascot-section-img"
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModal(true)}
            >
              + Publicar Partido Abierto
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 20,
          }}
        >
          {[
            { id: "all", label: "Todas las Categorías" },
            { id: "7ma", label: "7ma (Iniciación)" },
            { id: "6ta", label: "6ta (Intermedio)" },
            { id: "5ta", label: "5ta (Avanzado)" },
            { id: "Libre", label: "Libre / 4ta" },
            { id: "Damas", label: "Damas" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`booking-court-tab${selectedCat === tab.id ? " active" : ""}`}
              onClick={() => setSelectedCat(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="open-cards-grid">
          {filteredMatches.length === 0 ? (
            <div
              className="booking-empty"
              style={{
                gridColumn: "1 / -1",
                padding: "36px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ maxWidth: 460 }}>
                <strong style={{ display: "block", fontSize: 16, marginBottom: 6, color: "var(--text-primary)" }}>
                  No hay partidos abiertos programados hoy
                </strong>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
                  ¡Sé el primero en armar uno para tu nivel o sumate al grupo oficial de WhatsApp del club para enterarte al instante de nuevas convocatorias!
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-linear-primary"
                  onClick={() => setCreateModal(true)}
                  style={{ height: 40 }}
                >
                  + Publicar Partido Abierto
                </button>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("¡Hola Muzzaga! Quiero sumarme al grupo de WhatsApp de Canchas Abiertas.")}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary-whatsapp"
                  style={{ height: 40, gap: 8 }}
                >
                  Sumarme al Grupo de WhatsApp →
                </a>
              </div>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const freeCount = match.players.filter((p) => !p.taken).length;
              const isFull = freeCount === 0;

              return (
                <div className="open-card" key={match.id}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <span className={`badge-linear ${match.badgeColor}`}>
                        {match.category}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {match.time}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "12px 0 4px",
                      }}
                    >
                      {match.courtName}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        minHeight: 44,
                      }}
                    >
                      {match.desc}
                    </p>

                    <div className="player-slots-layout">
                      {match.players.map((player, idx) =>
                        player.taken ? (
                          <div
                            key={idx}
                            className="player-slot-item taken"
                            title={player.name}
                          >
                            ✓ {player.name.split(" ")[0]}
                          </div>
                        ) : (
                          <button
                            key={idx}
                            type="button"
                            className="player-slot-item free-clickable"
                            onClick={() =>
                              setJoinModal({
                                matchId: match.id,
                                slotIndex: idx,
                                match,
                              })
                            }
                            title="Hacé clic para sumarte a este lugar"
                          >
                            +1 ¡Sumarme!
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: 14,
                      marginTop: 16,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          display: "block",
                        }}
                      >
                        Tu plaza:
                      </span>
                      <strong
                        style={{ color: "var(--text-primary)", fontSize: 16 }}
                      >
                        ${match.pricePerPlayer.toLocaleString("es-AR")}
                      </strong>
                    </div>

                    {isFull ? (
                      <span
                        className="badge-linear badge-emerald"
                        style={{ fontSize: 12 }}
                      >
                        ✓ Partido Completo
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-whatsapp"
                        style={{
                          height: 36,
                          padding: "6px 14px",
                          fontSize: 13,
                        }}
                        onClick={() => {
                          const firstFreeIdx = match.players.findIndex(
                            (p) => !p.taken,
                          );
                          setJoinModal({
                            matchId: match.id,
                            slotIndex: firstFreeIdx,
                            match,
                          });
                        }}
                      >
                        Sumarme ({freeCount} libre{freeCount > 1 ? "s" : ""}) →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL PARA SUMARSE A UN SLOT */}
      {joinModal && (
        <Portal>
        <div
          className="admin-modal-backdrop"
          onClick={() => setJoinModal(null)}
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
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Sumarme a Cancha Abierta
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setJoinModal(null)}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              Partido: <strong>{joinModal.match.category}</strong> en{" "}
              {joinModal.match.courtName} ({joinModal.match.time}).
            </p>

            <form onSubmit={handleJoinSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="admin-field-label">
                  Tu Nombre y Apellido:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas Gómez"
                  className="admin-input-field"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="admin-field-label">
                  Tu Teléfono (WhatsApp):
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 299 597 4176"
                  className="admin-input-field"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-linear-primary"
                style={{ width: "100%", height: 44, justifyContent: "center" }}
                disabled={joinSubmitting}
              >
                {joinSubmitting
                  ? "Registrando plaza..."
                  : `Confirmar mi lugar ($${PRECIO_POR_JUGADOR.toLocaleString("es-AR")}) →`}
              </button>
            </form>
          </div>
        </div>
        </Portal>
      )}

      {/* MODAL PARA CREAR CONVOCATORIA */}
      {createModal && (
        <Portal>
        <div
          className="admin-modal-backdrop"
          onClick={() => setCreateModal(false)}
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
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Publicar Convocatoria Abierta
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="admin-field-label">Categoría / Nivel:</label>
                <select
                  className="admin-modal-select"
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, category: e.target.value })
                  }
                >
                  <option value="7ma / Iniciación (1.5 - 2.9)">
                    7ma / Iniciación (1.5 - 2.9)
                  </option>
                  <option value="6ta Categoría (3.0 - 3.9)">
                    6ta Categoría (3.0 - 3.9)
                  </option>
                  <option value="5ta / Libre (4.0 - 5.5+)">
                    5ta / Libre (4.0 - 5.5+)
                  </option>
                  <option value="Torneo Damas A/B">Torneo Damas A/B</option>
                </select>
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
                  <label className="admin-field-label">Cancha:</label>
                  <select
                    className="admin-modal-select"
                    value={createForm.courtName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        courtName: e.target.value,
                      })
                    }
                  >
                    <option value="Cancha 1 · Cristal">
                      Cancha 1 · Cristal
                    </option>
                    <option value="Cancha 2 · Cristal">
                      Cancha 2 · Cristal
                    </option>
                  </select>
                </div>

                <div>
                  <label className="admin-field-label">Horario:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 20:00 hs"
                    className="admin-input-field"
                    value={createForm.time}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, time: e.target.value })
                    }
                  />
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
                    Tu Nombre (Organizador):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className="admin-input-field"
                    value={createForm.creatorName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        creatorName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-field-label">Tu WhatsApp:</label>
                  <input
                    type="tel"
                    placeholder="Tu teléfono"
                    className="admin-input-field"
                    value={createForm.creatorPhone}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        creatorPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="admin-field-label">
                  Descripción del partido:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Buscamos 2 jugadores con buen revés para partido parejo"
                  className="admin-input-field"
                  value={createForm.desc}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, desc: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-linear-primary"
                style={{ width: "100%", height: 44, justifyContent: "center" }}
                disabled={createSubmitting}
              >
                {createSubmitting ? "Publicando..." : "Publicar Convocatoria →"}
              </button>
            </form>
          </div>
        </div>
        </Portal>
      )}
    </section>
  );
}
