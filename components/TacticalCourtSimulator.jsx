"use client";

import { useState } from "react";

const TACTICS = [
  {
    id: "vibora",
    title: "Víbora con peso a la reja",
    badge: "Ataque · Nivel 3.5+",
    badgeColor: "badge-amber",
    desc: "Impacto lateral a la altura de la cabeza con efecto cortado agresivo. La bola busca picar profundo y morir en la reja lateral con rebote impredecible.",
    tip: "Girá los hombros rápido y no busques potencia pura, sino efecto lateral cortado.",
    playerPos: { x: 130, y: 190 },
    targetPos: { x: 265, y: 80 },
    bouncePos: { x: 250, y: 110 },
    trajectory: "M 130 190 Q 200 130, 250 110 Q 260 95, 270 70",
  },
  {
    id: "salida_pared",
    title: "Salida de pared defensiva cruzada",
    badge: "Defensa · Todos los niveles",
    badgeColor: "badge-emerald",
    desc: "Acompañá la bola cuando sale del cristal de fondo de 10mm. Ganá tiempo con un tiro cruzado profundo para que tu pareja pueda reorganizarse.",
    tip: "Flexioná las rodillas y pegale delante del cuerpo una vez que la pelota superó el rebote en el cristal.",
    playerPos: { x: 80, y: 440 },
    targetPos: { x: 230, y: 90 },
    bouncePos: { x: 230, y: 140 },
    trajectory: "M 80 440 Q 150 280, 230 140 Q 235 110, 235 80",
  },
  {
    id: "chiquita",
    title: "Chiquita al centro a los pies",
    badge: "Táctica · Transición",
    badgeColor: "badge-indigo",
    desc: "Tiro suave y sin fuerza que cae justo por debajo de la cinta de la red, obligando a los rivales a levantar la pelota para que vos entres a definir.",
    tip: "Mantené la pala firme y no aceleres el brazo. La precisión y la baja altura mandan.",
    playerPos: { x: 80, y: 380 },
    targetPos: { x: 150, y: 220 },
    bouncePos: { x: 150, y: 230 },
    trajectory: "M 80 380 Q 110 290, 150 230",
  },
  {
    id: "smash_x3",
    title: "Smash por 3 (Definición)",
    badge: "Potencia & Efecto · Avanzado",
    badgeColor: "badge-amber",
    desc: "Remate con efecto liftado (topspin) buscando que la pelota pique antes de la línea de saque, impacte alto en el cristal de fondo y salga por el lateral de 3 metros.",
    tip: "Ubicá el cuerpo bien de costado y pegale en el punto más alto arqueando la espalda.",
    playerPos: { x: 170, y: 220 },
    targetPos: { x: 285, y: 30 },
    bouncePos: { x: 130, y: 70 },
    trajectory: "M 170 220 L 130 70 Q 130 30, 285 30",
  },
];

export default function TacticalCourtSimulator() {
  const [activeTacticId, setActiveTacticId] = useState("vibora");
  const tactic = TACTICS.find((t) => t.id === activeTacticId) || TACTICS[0];

  return (
    <section id="pizarra-tactica" className="section-turnos" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-indigo" style={{ marginBottom: 8 }}>
              Innovación &amp; Entrenamiento
            </span>
            <h2 className="section-title">Pizarra Táctica Interactiva</h2>
            <p className="section-desc">
              Visualizá trayectorias, zonas de impacto y secretos tácticos sobre el césped y cristal de Muzzaga.
            </p>
          </div>
        </div>

        <div className="tactical-board-grid">
          {/* CANCHA SVG INTERACTIVA */}
          <div className="tactical-court-wrap">
            <svg
              className="tactical-court-svg"
              viewBox="0 0 300 500"
              preserveAspectRatio="xMidYMid meet"
              aria-label="Cancha de pádel interactiva de cristal"
            >
              <defs>
                <linearGradient id="courtGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0b1b33" />
                  <stop offset="100%" stopColor="#040c1a" />
                </linearGradient>
                <filter id="neonGlow" x1="-20%" y1="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Court Surface */}
              <rect x="20" y="20" width="260" height="460" rx="6" fill="url(#courtGlow)" stroke="#38bdf8" strokeWidth="2" />

              {/* Glass Wall Indicators */}
              <rect x="18" y="16" width="264" height="6" fill="#38bdf8" opacity="0.8" rx="2" />
              <rect x="18" y="478" width="264" height="6" fill="#38bdf8" opacity="0.8" rx="2" />
              <rect x="14" y="18" width="6" height="100" fill="#38bdf8" opacity="0.8" rx="2" />
              <rect x="280" y="18" width="6" height="100" fill="#38bdf8" opacity="0.8" rx="2" />
              <rect x="14" y="382" width="6" height="100" fill="#38bdf8" opacity="0.8" rx="2" />
              <rect x="280" y="382" width="6" height="100" fill="#38bdf8" opacity="0.8" rx="2" />

              {/* Net Line (Center) */}
              <line x1="16" y1="250" x2="284" y2="250" stroke="#ffffff" strokeWidth="3" strokeDasharray="4 2" opacity="0.9" />
              <circle cx="150" cy="250" r="4" fill="#ffffff" />

              {/* Service Boxes Lines Top */}
              <line x1="20" y1="130" x2="280" y2="130" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
              <line x1="150" y1="130" x2="150" y2="250" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />

              {/* Service Boxes Lines Bottom */}
              <line x1="20" y1="370" x2="280" y2="370" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
              <line x1="150" y1="250" x2="150" y2="370" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />

              {/* Trajectory Path */}
              <path
                d={tactic.trajectory}
                fill="none"
                stroke="#e8722a"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#neonGlow)"
                className="animated-ball-trajectory"
              />

              {/* Player Spot */}
              <g transform={`translate(${tactic.playerPos.x}, ${tactic.playerPos.y})`}>
                <circle r="12" fill="rgba(232, 114, 42, 0.2)" stroke="#e8722a" strokeWidth="2" />
                <circle r="6" fill="#e8722a" />
                <text x="0" y="20" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Jugador
                </text>
              </g>

              {/* Target / Bounce Spot */}
              {tactic.bouncePos && (
                <g transform={`translate(${tactic.bouncePos.x}, ${tactic.bouncePos.y})`}>
                  <circle r="8" fill="rgba(56, 189, 248, 0.3)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                  <circle r="3" fill="#38bdf8" />
                  <text x="0" y="-12" fill="#38bdf8" fontSize="9" textAnchor="middle">
                    Pique
                  </text>
                </g>
              )}
            </svg>
            <div className="court-glass-indicator">Cristal Templado 10mm Muzzaga</div>
          </div>

          {/* CONTROLES Y TIPS DE ENTRENADORES */}
          <div className="tactical-info-card">
            <h3 style={{ fontSize: 16, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Elegí la jugada a analizar:
            </h3>

            <div className="tactic-buttons-list">
              {TACTICS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`tactic-select-btn${item.id === activeTacticId ? " active" : ""}`}
                  onClick={() => setActiveTacticId(item.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <span className={`badge-linear ${item.badgeColor}`} style={{ fontSize: 10 }}>
                      {item.badge.split(" · ")[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="tactic-detail-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className={`badge-linear ${tactic.badgeColor}`}>{tactic.badge}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Catriel Padel Pro
                </span>
              </div>
              <h4 style={{ fontSize: 18, color: "var(--text-primary)", margin: "6px 0 10px" }}>
                {tactic.title}
              </h4>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {tactic.desc}
              </p>

              <div className="pro-tip-box">
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#38bdf8", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  <span>💡 Tip del Pro de Muzzaga:</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                  {tactic.tip}
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/5492995974176?text=Hola%20Muzzaga!%20Quiero%20consultar%20por%20clases%20particulares%20o%20entrenamiento%20tactico."
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            >
              Consultar por Clases Tácticas en Pista →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
