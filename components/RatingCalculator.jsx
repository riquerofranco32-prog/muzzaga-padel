"use client";

import { useMemo, useState } from "react";

function categoryFor(val) {
  if (val < 2.8) {
    return {
      name: "7ma Categoría",
      badge: "badge-emerald",
      label: "7MA CATEGORÍA · Iniciación (1.5 - 2.7)",
      desc: "Estás afianzando tus golpes de fondo, saque y aprendiendo a leer el rebote en paredes. ¡Los partidos de 7ma y Canchas Abiertas son ideales para vos!",
    };
  }
  if (val >= 4.0) {
    return {
      name: "5ta / Libre",
      badge: "badge-indigo",
      label: "5TA / CATEGORÍA LIBRE · Avanzado (4.0 - 5.5+)",
      desc: "Tenés lectura táctica veloz, variantes agresivas en la red y remate con salida por 3. Estás listo para el cuadro de torneos de primera y desafíos competitivos.",
    };
  }
  return {
    name: "6ta Categoría",
    badge: "badge-amber",
    label: "6TA CATEGORÍA · Intermedio (2.8 - 3.9)",
    desc: "Voleas consistentes, manejo de bandeja y salida de pared firme. Tu nivel te permite competir en torneos de 6ta y partidos parejos todas las semanas.",
  };
}

export default function RatingCalculator() {
  const [mode, setMode] = useState("quiz"); // 'quiz' | 'slider'
  const [quizAnswers, setQuizAnswers] = useState({
    exp: 1, // 0: <6m, 1: 6m-2a, 2: >2a
    wall: 1, // 0: basico, 1: intermedio, 2: avanzado
    net: 1, // 0: defiendo, 1: voleo firme, 2: remate
  });
  const [raw, setRaw] = useState(34);

  // Calculate rating from quiz if in quiz mode, otherwise from raw slider
  const computedRating = useMemo(() => {
    if (mode === "slider") {
      return (raw / 10).toFixed(1);
    }
    // Quiz weights: 1.5 baseline + exp*0.7 + wall*0.7 + net*0.7
    const score = 1.6 + quizAnswers.exp * 0.7 + quizAnswers.wall * 0.7 + quizAnswers.net * 0.7;
    return Math.min(5.5, Math.max(1.8, Number(score.toFixed(1))));
  }, [mode, raw, quizAnswers]);

  const category = useMemo(() => categoryFor(Number(computedRating)), [computedRating]);

  const whatsappUrl = `https://wa.me/5492995974176?text=${encodeURIComponent(
    `¡Hola Muzzaga! Hice el test de nivel en la web y me dio ${computedRating} (${category.name}). Quiero sumarme a los partidos abiertos y torneos.`,
  )}`;

  return (
    <div className="rating-box">
      <div className="rating-mode-switch">
        <button
          type="button"
          className={`rating-tab-btn${mode === "quiz" ? " active" : ""}`}
          onClick={() => setMode("quiz")}
        >
          ⚡ Test Guiado (3 Preguntas)
        </button>
        <button
          type="button"
          className={`rating-tab-btn${mode === "slider" ? " active" : ""}`}
          onClick={() => setMode("slider")}
        >
          🎚️ Ajuste Manual
        </button>
      </div>

      <div className="rating-header-display">
        <span className="rating-badge-pill">Tu Nivel Estimado</span>
        <div className="rating-display-val">{computedRating}</div>
        <div className={`badge-linear ${category.badge}`} style={{ fontSize: 13, padding: "4px 12px" }}>
          {category.label}
        </div>
      </div>

      {mode === "quiz" ? (
        <div className="quiz-questions-wrapper">
          <div className="quiz-question-group">
            <label className="quiz-label">1. ¿Cuánto tiempo llevás jugando al pádel?</label>
            <div className="quiz-options-grid">
              {[
                { label: "Menos de 6 meses", val: 0 },
                { label: "Entre 6 meses y 2 años", val: 1 },
                { label: "Más de 2 años", val: 2 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`quiz-opt-btn${quizAnswers.exp === opt.val ? " selected" : ""}`}
                  onClick={() => setQuizAnswers((prev) => ({ ...prev, exp: opt.val }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-question-group">
            <label className="quiz-label">2. ¿Cómo te manejás en el rebote con pared de cristal?</label>
            <div className="quiz-options-grid">
              {[
                { label: "Me cuesta calcular el rebote", val: 0 },
                { label: "Paso la bola con control", val: 1 },
                { label: "Ataco de fondo y cambio ritmo", val: 2 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`quiz-opt-btn${quizAnswers.wall === opt.val ? " selected" : ""}`}
                  onClick={() => setQuizAnswers((prev) => ({ ...prev, wall: opt.val }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-question-group">
            <label className="quiz-label">3. En la red y definición:</label>
            <div className="quiz-options-grid">
              {[
                { label: "Prefiero jugar en el fondo", val: 0 },
                { label: "Voleas firmes y bandeja", val: 1 },
                { label: "Remate por 3 / definición", val: 2 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`quiz-opt-btn${quizAnswers.net === opt.val ? " selected" : ""}`}
                  onClick={() => setQuizAnswers((prev) => ({ ...prev, net: opt.val }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              display: "block",
              marginBottom: 8,
            }}
          >
            Ajustá con precisión tu nivel en pista (1.5 a 5.5+):
          </label>
          <input
            type="range"
            min="15"
            max="55"
            value={raw}
            onChange={(e) => setRaw(Number(e.target.value))}
            aria-label="Nivel de juego estimado"
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            <span>1.5 (Iniciación)</span>
            <span>3.5 (Intermedio)</span>
            <span>5.5+ (Avanzado)</span>
          </div>
        </div>
      )}

      <p className="rating-desc-text">{category.desc}</p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        className="btn btn-linear-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Sumarme a partidos de mi nivel por WhatsApp →
      </a>
    </div>
  );
}

