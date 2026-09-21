"use client";

import { useMemo, useState } from "react";

const DEFAULT_NAMES = ["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"];

function generateFixtures(names) {
  const n = names.length;
  if (n === 4) {
    return [
      { round: 1, p1: names[0], p2: names[1], p3: names[2], p4: names[3] },
      { round: 2, p1: names[0], p2: names[2], p3: names[1], p4: names[4 - 1] },
      { round: 3, p1: names[0], p2: names[3], p3: names[1], p4: names[2] },
    ];
  }
  if (n === 5) {
    return [
      { round: 1, p1: names[0], p2: names[1], p3: names[2], p4: names[3], bye: names[4] },
      { round: 2, p1: names[0], p2: names[2], p3: names[3], p4: names[4], bye: names[1] },
      { round: 3, p1: names[0], p2: names[3], p3: names[1], p4: names[4], bye: names[2] },
      { round: 4, p1: names[0], p2: names[4], p3: names[1], p4: names[2], bye: names[3] },
      { round: 5, p1: names[1], p2: names[3], p3: names[2], p4: names[4], bye: names[0] },
    ];
  }
  // Default general 4-round generator for 6-8
  const rounds = [];
  for (let r = 1; r <= Math.min(n, 5); r++) {
    const shift = (r - 1) % n;
    const shuffled = [...names.slice(shift), ...names.slice(0, shift)];
    rounds.push({
      round: r,
      p1: shuffled[0],
      p2: shuffled[1],
      p3: shuffled[2],
      p4: shuffled[3],
      bye: n > 4 ? shuffled.slice(4).join(", ") : null,
    });
  }
  return rounds;
}

export default function AmericanoGenerator() {
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [copied, setCopied] = useState(false);

  const handleCountChange = (count) => {
    setPlayerCount(count);
    const newNames = Array.from({ length: count }, (_, i) => names[i] || `Jugador ${i + 1}`);
    setNames(newNames);
  };

  const handleNameChange = (idx, val) => {
    setNames((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const fixtures = useMemo(() => generateFixtures(names), [names]);

  const copyFixture = () => {
    let msg = `*TORNEO AMERICANO EXPRESS - MUZZAGA PÁDEL*\n`;
    msg += `Jugadores (${playerCount}): ${names.join(", ")}\n\n`;
    fixtures.forEach((f) => {
      msg += `• RONDA ${f.round}:\n`;
      msg += `   ${f.p1} & ${f.p2}  vs  ${f.p3} & ${f.p4}\n`;
      if (f.bye) msg += `   Libre: ${f.bye}\n`;
      msg += `\n`;
    });
    msg += `Al finalizar: Tercer tiempo en la cantina de Muzzaga`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="generador-americano" className="section-turnos">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Herramienta Comunitaria
            </span>
            <h2 className="section-title">Generador de Torneo Americano</h2>
            <p className="section-desc">
              Armá las rotaciones de parejas al instante para que todos jueguen con y contra todos en partidos de 4 games.
            </p>
          </div>
        </div>

        <div className="americano-layout-grid">
          {/* CONFIGURACIÓN DE JUGADORES */}
          <div className="americano-config-card">
            <h3 style={{ fontSize: 16, color: "var(--text-primary)", marginBottom: 14 }}>
              1. Cantidad de jugadores:
            </h3>

            <div className="americano-count-tabs">
              {[4, 5, 6, 7, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`americano-count-btn${playerCount === count ? " active" : ""}`}
                  onClick={() => handleCountChange(count)}
                >
                  {count} jugadores
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, color: "var(--text-primary)", margin: "20px 0 12px" }}>
              2. Nombres de los participantes:
            </h3>

            <div className="americano-names-grid">
              {names.map((name, idx) => (
                <div key={idx} className="americano-name-input-row">
                  <span className="name-idx-badge">{idx + 1}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Jugador ${idx + 1}`}
                    className="americano-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* FIXTURE GENERADO */}
          <div className="americano-fixture-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <span className="badge-linear badge-emerald">Fixture Automático</span>
                <h3 style={{ fontSize: 17, color: "var(--text-primary)", margin: "4px 0 0" }}>
                  Rondas &amp; Cruces de Parejas
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-whatsapp"
                style={{ height: 36, padding: "6px 14px", fontSize: 13, gap: 6 }}
                onClick={copyFixture}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z"/>
                </svg>
                {copied ? "Copiado" : "Compartir en WhatsApp"}
              </button>
            </div>

            <div className="fixture-rounds-list">
              {fixtures.map((fix) => (
                <div key={fix.round} className="fixture-round-item">
                  <div className="fixture-round-badge">Ronda {fix.round}</div>
                  <div className="fixture-matchup">
                    <div className="fixture-team">
                      <strong>{fix.p1}</strong> &amp; <strong>{fix.p2}</strong>
                    </div>
                    <span className="fixture-vs">VS</span>
                    <div className="fixture-team">
                      <strong>{fix.p3}</strong> &amp; <strong>{fix.p4}</strong>
                    </div>
                  </div>
                  {fix.bye && (
                    <div className="fixture-bye">
                      Descansa: <span>{fix.bye}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, textAlign: "center" }}>
              Formato recomendado: Partidos a 4 o 6 games corridos con punto de oro en el 40-40.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
