"use client";

import { useState } from "react";

// Datos de ejemplo para el cuadro del último torneo en vivo
const BRACKET_DATA = {
  "6ta": {
    name: "6ta Categoría Caballeros (Torneo Primavera 2026)",
    rounds: [
      {
        id: "cuartos",
        name: "Cuartos de Final",
        matches: [
          {
            id: "m1",
            court: "Cancha 1",
            time: "18:00 hs",
            status: "finished",
            t1: { name: "G. Navarro / M. Morales", score: ["6", "4", "6"], winner: true },
            t2: { name: "F. Castillo / D. Soto", score: ["4", "6", "3"], winner: false },
          },
          {
            id: "m2",
            court: "Cancha 2",
            time: "18:00 hs",
            status: "finished",
            t1: { name: "A. Rossi / L. Benítez", score: ["6", "7"], winner: true },
            t2: { name: "E. Vidal / J. Méndez", score: ["3", "5"], winner: false },
          },
          {
            id: "m3",
            court: "Cancha 1",
            time: "19:30 hs",
            status: "finished",
            t1: { name: "C. Ortiz / R. Pardo", score: ["7", "6"], winner: true },
            t2: { name: "N. Silva / T. Quiroga", score: ["5", "3"], winner: false },
          },
          {
            id: "m4",
            court: "Cancha 2",
            time: "19:30 hs",
            status: "finished",
            t1: { name: "M. Gómez / P. Vega", score: ["3", "6", "6"], winner: true },
            t2: { name: "I. Ferreyra / S. Lagos", score: ["6", "4", "2"], winner: false },
          },
        ],
      },
      {
        id: "semis",
        name: "Semifinales",
        matches: [
          {
            id: "m5",
            court: "Cancha 1",
            time: "21:00 hs",
            status: "live",
            t1: { name: "G. Navarro / M. Morales", score: ["6", "4"], winner: false },
            t2: { name: "A. Rossi / L. Benítez", score: ["4", "5"], winner: false },
          },
          {
            id: "m6",
            court: "Cancha 2",
            time: "21:00 hs",
            status: "live",
            t1: { name: "C. Ortiz / R. Pardo", score: ["5", "3"], winner: false },
            t2: { name: "M. Gómez / P. Vega", score: ["7", "4"], winner: false },
          },
        ],
      },
      {
        id: "final",
        name: "Gran Final",
        matches: [
          {
            id: "m7",
            court: "Cancha 1 (Cristal Central)",
            time: "22:45 hs",
            status: "scheduled",
            t1: { name: "Ganador Semifinal 1", score: ["-"], winner: false },
            t2: { name: "Ganador Semifinal 2", score: ["-"], winner: false },
          },
        ],
      },
    ],
  },
  "7ma": {
    name: "7ma Categoría Principiantes",
    rounds: [
      {
        id: "semis",
        name: "Semifinales",
        matches: [
          {
            id: "s1",
            court: "Cancha 1",
            time: "16:00 hs",
            status: "finished",
            t1: { name: "B. Alarcón / K. Díaz", score: ["6", "6"], winner: true },
            t2: { name: "H. Luna / V. Godoy", score: ["2", "4"], winner: false },
          },
          {
            id: "s2",
            court: "Cancha 2",
            time: "16:00 hs",
            status: "finished",
            t1: { name: "M. Riquelme / S. Bravo", score: ["6", "3", "6"], winner: true },
            t2: { name: "P. Toledo / F. Mansilla", score: ["4", "6", "3"], winner: false },
          },
        ],
      },
      {
        id: "final",
        name: "Final",
        matches: [
          {
            id: "f1",
            court: "Cancha 1",
            time: "20:00 hs",
            status: "finished",
            t1: { name: "B. Alarcón / K. Díaz", score: ["7", "6"], winner: true },
            t2: { name: "M. Riquelme / S. Bravo", score: ["5", "4"], winner: false },
          },
        ],
      },
    ],
  },
};

export default function TournamentBracket() {
  const [selectedCat, setSelectedCat] = useState("6ta");
  const [activeRoundTab, setActiveRoundTab] = useState("all");

  const bracket = BRACKET_DATA[selectedCat];

  return (
    <div
      style={{
        background: "var(--color-surface-card)",
        border: "1px solid var(--color-hairline-strong)",
        borderRadius: "var(--radius-xl, 16px)",
        padding: "24px 20px",
        marginTop: 24,
        marginBottom: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
          borderBottom: "1px solid var(--color-hairline)",
          paddingBottom: 16,
        }}
      >
        <div>
          <span className="badge-linear badge-amber" style={{ marginBottom: 6 }}>
            Cuadros Oficiales en Vivo
          </span>
          <h3 style={{ margin: 0, fontSize: 20, color: "var(--color-ink)" }}>
            {bracket.name}
          </h3>
        </div>

        {/* SELECTOR DE CATEGORÍA */}
        <div style={{ display: "flex", gap: 8 }}>
          {Object.keys(BRACKET_DATA).map((catKey) => (
            <button
              key={catKey}
              type="button"
              className={`booking-court-tab${selectedCat === catKey ? " active" : ""}`}
              onClick={() => {
                setSelectedCat(catKey);
                setActiveRoundTab("all");
              }}
            >
              {catKey} Categoría
            </button>
          ))}
        </div>
      </div>

      {/* TABS DE RONDA PARA MOBILE */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 18,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          className={`booking-court-tab${activeRoundTab === "all" ? " active" : ""}`}
          onClick={() => setActiveRoundTab("all")}
          style={{ fontSize: 12.5 }}
        >
          Ver todo el cuadro
        </button>
        {bracket.rounds.map((round) => (
          <button
            key={round.id}
            type="button"
            className={`booking-court-tab${activeRoundTab === round.id ? " active" : ""}`}
            onClick={() => setActiveRoundTab(round.id)}
            style={{ fontSize: 12.5, whiteSpace: "nowrap" }}
          >
            {round.name}
          </button>
        ))}
      </div>

      {/* ÁRBOL DE CUADRO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            activeRoundTab === "all"
              ? `repeat(auto-fit, minmax(min(270px, 100%), 1fr))`
              : "1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {bracket.rounds
          .filter((r) => activeRoundTab === "all" || r.id === activeRoundTab)
          .map((round) => (
            <div key={round.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-accent-orange)",
                  padding: "4px 8px",
                  background: "var(--color-surface-subtle)",
                  borderRadius: "var(--radius-sm)",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {round.name}
              </div>

              {round.matches.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "var(--color-canvas)",
                    border: `1px solid ${
                      m.status === "live"
                        ? "rgba(37, 211, 102, 0.5)"
                        : "var(--color-hairline-strong)"
                    }`,
                    borderRadius: "var(--radius-lg, 12px)",
                    padding: "12px 14px",
                    boxShadow:
                      m.status === "live"
                        ? "0 4px 14px rgba(37, 211, 102, 0.15)"
                        : "none",
                  }}
                >
                  {/* HEADER DEL MATCH */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 11,
                      color: "var(--color-muted)",
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      {m.court} · {m.time}
                    </span>
                    {m.status === "live" ? (
                      <span
                        style={{
                          color: "#16a34a",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#16a34a",
                            display: "inline-block",
                          }}
                        />
                        EN VIVO
                      </span>
                    ) : m.status === "finished" ? (
                      <span>Finalizado</span>
                    ) : (
                      <span>Programado</span>
                    )}
                  </div>

                  {/* PAREJA 1 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      fontWeight: m.t1.winner ? 700 : 500,
                      color: m.t1.winner ? "var(--color-ink)" : "var(--color-body)",
                    }}
                  >
                    <span style={{ fontSize: 13.5 }}>
                      {m.t1.winner && "🏆 "}
                      {m.t1.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 13,
                        color: m.t1.winner ? "var(--color-accent-orange)" : "inherit",
                      }}
                    >
                      {m.t1.score.join(" ")}
                    </span>
                  </div>

                  {/* DIVIDER */}
                  <div style={{ height: 1, background: "var(--color-hairline)", margin: "4px 0" }} />

                  {/* PAREJA 2 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      fontWeight: m.t2.winner ? 700 : 500,
                      color: m.t2.winner ? "var(--color-ink)" : "var(--color-body)",
                    }}
                  >
                    <span style={{ fontSize: 13.5 }}>
                      {m.t2.winner && "🏆 "}
                      {m.t2.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 13,
                        color: m.t2.winner ? "var(--color-accent-orange)" : "inherit",
                      }}
                    >
                      {m.t2.score.join(" ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
