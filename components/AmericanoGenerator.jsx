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
    let msg = `🏆 *TORNEO AMERICANO EXPRESS - MUZZAGA PÁDEL*\n`;
    msg += `👥 *Jugadores (${playerCount}):* ${names.join(", ")}\n\n`;
    fixtures.forEach((f) => {
      msg += `📍 *RONDA ${f.round}:*\n`;
      msg += `   ${f.p1} & ${f.p2}  🆚  ${f.p3} & ${f.p4}\n`;
      if (f.bye) msg += `   ⏸️ Libre: ${f.bye}\n`;
      msg += `\n`;
    });
    msg += `🍻 *Al finalizar:* ¡Tercer tiempo en la cantina de Muzzaga!`;

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
                className={`btn ${copied ? "btn-whatsapp" : "btn-linear-primary"}`}
                style={{ height: 36, padding: "6px 14px", fontSize: 13 }}
                onClick={copyFixture}
              >
                {copied ? "✓ ¡Copiado!" : "📋 Compartir en WhatsApp"}
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
                      ⏸️ Descansa: <span>{fix.bye}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14, textAlign: "center" }}>
              💡 Formato recomendado: Partidos a 4 o 6 games corridos con punto de oro en el 40-40.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
