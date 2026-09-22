"use client";

import { useMemo, useState } from "react";
import {
  generateFixtures,
  buildAmericanoShareMessage,
  buildAmericanoWhatsAppUrl,
} from "../lib/americano";

const DEFAULT_NAMES = ["Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4"];

export default function AmericanoGenerator() {
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [scores, setScores] = useState({}); // { [round]: { t1: number, t2: number } }
  const [copied, setCopied] = useState(false);

  const handleCountChange = (count) => {
    setPlayerCount(count);
    const newNames = Array.from(
      { length: count },
      (_, i) => names[i] || `Jugador ${i + 1}`,
    );
    setNames(newNames);
    setScores({});
  };

  const handleNameChange = (idx, val) => {
    setNames((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleScoreChange = (round, team, val) => {
    const num = val === "" ? "" : Math.max(0, Math.min(20, Number(val) || 0));
    setScores((prev) => ({
      ...prev,
      [round]: {
        ...(prev[round] || { t1: "", t2: "" }),
        [team]: num,
      },
    }));
  };

  const fixtures = useMemo(() => generateFixtures(names), [names]);

  const whatsappUrl = useMemo(() => {
    return buildAmericanoWhatsAppUrl({
      names,
      fixtures,
      scores,
    });
  }, [names, fixtures, scores]);

  const copyFixture = () => {
    const msg = buildAmericanoShareMessage({
      names,
      fixtures,
      scores,
    });
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
              Armá las rotaciones de parejas al instante para que todos jueguen con y contra todos en partidos de 4 o 6 games. Anotá los resultados en vivo y compartilo por WhatsApp.
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div>
                <span className="badge-linear badge-emerald">Fixture Automático</span>
                <h3 style={{ fontSize: 17, color: "var(--text-primary)", margin: "4px 0 0" }}>
                  Rondas &amp; Cruces de Parejas
                </h3>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{
                    height: 36,
                    padding: "6px 12px",
                    fontSize: 12.5,
                    gap: 6,
                    textDecoration: "none",
                  }}
                  title="Abrir en WhatsApp y enviar fixture al grupo"
                >
                  <span>📲</span>
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: 36, padding: "6px 12px", fontSize: 12.5 }}
                  onClick={copyFixture}
                  title="Copiar fixture completo al portapapeles"
                >
                  {copied ? "✓ Copiado" : "📋 Copiar"}
                </button>
              </div>
            </div>

            <div className="fixture-rounds-list">
              {fixtures.map((fix) => {
                const roundScore = scores[fix.round] || { t1: "", t2: "" };
                return (
                  <div key={fix.round} className="fixture-round-item">
                    <div className="fixture-round-badge">Ronda {fix.round}</div>
                    <div className="fixture-matchup">
                      <div className="fixture-team">
                        <strong>{fix.p1}</strong> &amp; <strong>{fix.p2}</strong>
                      </div>

                      {/* Score Input */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          margin: "0 6px",
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={roundScore.t1}
                          onChange={(e) =>
                            handleScoreChange(fix.round, "t1", e.target.value)
                          }
                          placeholder="0"
                          style={{
                            width: 32,
                            height: 28,
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            borderRadius: 4,
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text-primary)",
                            padding: 0,
                          }}
                          title={`Games para ${fix.p1} & ${fix.p2}`}
                        />
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
                          -
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={roundScore.t2}
                          onChange={(e) =>
                            handleScoreChange(fix.round, "t2", e.target.value)
                          }
                          placeholder="0"
                          style={{
                            width: 32,
                            height: 28,
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            borderRadius: 4,
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text-primary)",
                            padding: 0,
                          }}
                          title={`Games para ${fix.p3} & ${fix.p4}`}
                        />
                      </div>

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
                );
              })}
            </div>

            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 14,
                textAlign: "center",
              }}
            >
              Formato recomendado: Partidos a 4 o 6 games corridos con punto de oro en el 40-40. Los resultados ingresados se incluyen al compartir por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
