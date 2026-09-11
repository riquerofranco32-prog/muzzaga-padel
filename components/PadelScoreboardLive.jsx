"use client";

import { useState } from "react";

const POINT_SEQUENCE = ["0", "15", "30", "40"];

export default function PadelScoreboardLive() {
  const [teamA, setTeamA] = useState("Pareja A");
  const [teamB, setTeamB] = useState("Pareja B");

  // Current Game Score (0, 15, 30, 40)
  const [scoreA, setScoreA] = useState(0); // index in POINT_SEQUENCE
  const [scoreB, setScoreB] = useState(0);

  // Sets & Games
  const [gamesA, setGamesA] = useState(0);
  const [gamesB, setGamesB] = useState(0);
  const [setsA, setSetsA] = useState(0);
  const [setsB, setSetsB] = useState(0);

  // Server
  const [server, setServer] = useState("A"); // "A" or "B"
  const [isTiebreak, setIsTiebreak] = useState(false);
  const [tbPointsA, setTbPointsA] = useState(0);
  const [tbPointsB, setTbPointsB] = useState(0);
  const [copied, setCopied] = useState(false);

  // Golden Point Detection (40-40)
  const isGoldenPoint = scoreA === 3 && scoreB === 3 && !isTiebreak;

  const winGame = (winner) => {
    setScoreA(0);
    setScoreB(0);
    setServer((s) => (s === "A" ? "B" : "A"));

    if (winner === "A") {
      const nextGames = gamesA + 1;
      if (nextGames === 6 && gamesB <= 4) {
        // Set A won
        setSetsA((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      } else if (nextGames === 7) {
        setSetsA((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      } else if (nextGames === 6 && gamesB === 6) {
        setIsTiebreak(true);
        setGamesA(6);
        setTbPointsA(0);
        setTbPointsB(0);
      } else {
        setGamesA(nextGames);
      }
    } else {
      const nextGames = gamesB + 1;
      if (nextGames === 6 && gamesA <= 4) {
        // Set B won
        setSetsB((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      } else if (nextGames === 7) {
        setSetsB((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      } else if (nextGames === 6 && gamesA === 6) {
        setIsTiebreak(true);
        setGamesB(6);
        setTbPointsA(0);
        setTbPointsB(0);
      } else {
        setGamesB(nextGames);
      }
    }
  };

  const addPointA = () => {
    if (isTiebreak) {
      const next = tbPointsA + 1;
      setTbPointsA(next);
      if (next >= 7 && next - tbPointsB >= 2) {
        setSetsA((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      }
      return;
    }

    if (scoreA === 3) {
      winGame("A");
    } else {
      setScoreA((s) => s + 1);
    }
  };

  const addPointB = () => {
    if (isTiebreak) {
      const next = tbPointsB + 1;
      setTbPointsB(next);
      if (next >= 7 && next - tbPointsA >= 2) {
        setSetsB((s) => s + 1);
        setGamesA(0);
        setGamesB(0);
        setIsTiebreak(false);
      }
      return;
    }

    if (scoreB === 3) {
      winGame("B");
    } else {
      setScoreB((s) => s + 1);
    }
  };

  const resetMatch = () => {
    setScoreA(0);
    setScoreB(0);
    setGamesA(0);
    setGamesB(0);
    setSetsA(0);
    setSetsB(0);
    setIsTiebreak(false);
    setTbPointsA(0);
    setTbPointsB(0);
  };

  const shareScore = () => {
    const text = `🎾 *MARCADOR EN VIVO MUZZAGA PÁDEL*\n` +
      `🔥 *${teamA}* vs *${teamB}*\n\n` +
      `🏆 Sets: ${setsA} - ${setsB}\n` +
      `📊 Juegos: ${gamesA} - ${gamesB}\n` +
      `⚡ Puntos actual: ${isTiebreak ? `${tbPointsA}-${tbPointsB} (Tie-Break)` : `${POINT_SEQUENCE[scoreA]} - ${POINT_SEQUENCE[scoreB]}`}\n\n` +
      `📍 Jugado en Muzzaga Pádel Catriel`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="marcador-en-vivo" className="section-turnos">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Innovación en Cancha · Web App
            </span>
            <h2 className="section-title">Marcador Digital &amp; Punto de Oro</h2>
            <p className="section-desc">
              Llevá el tanteo en vivo de tu partido con las reglas oficiales FIP (Punto de Oro en 40-40 y Tie-Break).
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={resetMatch} style={{ height: 36 }}>
              Reiniciar Partido
            </button>
            <button type="button" className="btn btn-linear-primary" onClick={shareScore} style={{ height: 36 }}>
              {copied ? "✓ ¡Copiado!" : "📱 Compartir Marcador"}
            </button>
          </div>
        </div>

        <div className="scoreboard-widget-box">
          {/* BANNER PUNTO DE ORO */}
          {isGoldenPoint && (
            <div className="golden-point-banner">
              <span>🔥 ¡PUNTO DE ORO! (El que gana este punto se lleva el Game)</span>
            </div>
          )}

          {/* TABLERO */}
          <div className="scoreboard-board">
            {/* CABECERA */}
            <div className="scoreboard-header-row">
              <span className="scoreboard-th-team">Parejas</span>
              <span className="scoreboard-th-col">Sets</span>
              <span className="scoreboard-th-col">Games</span>
              <span className="scoreboard-th-col active">Puntos</span>
              <span className="scoreboard-th-action">Acción</span>
            </div>

            {/* FILA PAREJA A */}
            <div className={`scoreboard-row${server === "A" ? " serving" : ""}`}>
              <div className="scoreboard-team-col">
                <span className="serving-indicator" title="Al saque">
                  {server === "A" ? "🎾" : "⚪"}
                </span>
                <input
                  type="text"
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="scoreboard-name-input"
                  placeholder="Pareja A"
                />
              </div>

              <div className="scoreboard-val-col sets">{setsA}</div>
              <div className="scoreboard-val-col games">{gamesA}</div>
              <div className="scoreboard-val-col points">
                {isTiebreak ? tbPointsA : POINT_SEQUENCE[scoreA]}
              </div>

              <div className="scoreboard-btn-col">
                <button
                  type="button"
                  className="btn-score-point"
                  onClick={addPointA}
                  aria-label="Sumar punto Pareja A"
                >
                  +1 Punto
                </button>
              </div>
            </div>

            {/* FILA PAREJA B */}
            <div className={`scoreboard-row${server === "B" ? " serving" : ""}`}>
              <div className="scoreboard-team-col">
                <span className="serving-indicator" title="Al saque">
                  {server === "B" ? "🎾" : "⚪"}
                </span>
                <input
                  type="text"
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="scoreboard-name-input"
                  placeholder="Pareja B"
                />
              </div>

              <div className="scoreboard-val-col sets">{setsB}</div>
              <div className="scoreboard-val-col games">{gamesB}</div>
              <div className="scoreboard-val-col points">
                {isTiebreak ? tbPointsB : POINT_SEQUENCE[scoreB]}
              </div>

              <div className="scoreboard-btn-col">
                <button
                  type="button"
                  className="btn-score-point"
                  onClick={addPointB}
                  aria-label="Sumar punto Pareja B"
                >
                  +1 Punto
                </button>
              </div>
            </div>
          </div>

          <div className="scoreboard-footer-hints">
            <span>💡 Modo FIP activo: Al empatar 40-40, no hay ventaja; el receptor elige lado y se define en Punto de Oro.</span>
            <button
              type="button"
              className="server-toggle-btn"
              onClick={() => setServer((s) => (s === "A" ? "B" : "A"))}
            >
              Cambiar Saque (Actual: {server === "A" ? teamA : teamB})
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
