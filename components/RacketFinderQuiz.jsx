"use client";

import { useState } from "react";

const RACKET_TYPES = {
  control: {
    name: "Redonda · Control Máximo",
    shape: "Redonda",
    balance: "Bajo (Maniobrable)",
    sweetSpot: "Amplio y Centrado",
    core: "Goma EVA Soft (Tacto Blando)",
    material: "Fibra de Vidrio / Carbono 3K",
    weight: "355 - 365 gr",
    idealFor: "Jugadores de Drive, principiantes a intermedios (7ma a 5ta) que buscan precisión, defensa cómoda desde el fondo y reducir vibraciones en el codo.",
    recom: ["Bullpadel Vertex Control", "Nox ML10 Pro Cup", "Siux Trilogy Control"],
  },
  polivalente: {
    name: "Lágrima · Equilibrio Total",
    shape: "Lágrima (Gota)",
    balance: "Medio (Equilibrado)",
    sweetSpot: "Medio-Alto",
    core: "Goma Black EVA Multi-densidad",
    material: "Carbono 12K / Carbon Frame",
    weight: "360 - 370 gr",
    idealFor: "Jugadores versátiles que defienden con seguridad y pasan al ataque con voleas rápidas y bandejas con peso.",
    recom: ["Babolat Technical Viper", "Head Speed Pro", "Nox AT10 Luxury 12K"],
  },
  potencia: {
    name: "Diamante · Potencia Agresiva",
    shape: "Diamante",
    balance: "Alto (Cabezona)",
    sweetSpot: "Alto y Concentrado",
    core: "Goma Hard EVA (Tacto Firme)",
    material: "Carbono 18K / Aluminizado",
    weight: "365 - 375 gr",
    idealFor: "Jugadores de Revés con técnica sólida que buscan definir por 3 metros, remates potentes y bloqueos agresivos en la red.",
    recom: ["Bullpadel Hack 03", "Babolat Technical Veron", "Adidas Metalbone HRD"],
  },
};

export default function RacketFinderQuiz() {
  const [playStyle, setPlayStyle] = useState("polivalente");
  const [level, setLevel] = useState("intermedio");
  const [injuryHistory, setInjuryHistory] = useState(false);

  const current = RACKET_TYPES[playStyle];

  const shareWhatsApp = () => {
    const text = `¡Hola Muzzaga! Hice el Test de Palas en la web y me recomendó formato *${current.shape}* (${current.name}) para nivel *${level}*. ¿Tienen palas test para probar en el club?`;
    window.open(`https://wa.me/5492995974176?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="buscador-palas" className="section-turnos" style={{ background: "var(--color-canvas-soft)", borderTop: "1px solid var(--color-hairline)", borderBottom: "1px solid var(--color-hairline)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Equipamiento &amp; Pro Shop
            </span>
            <h2 className="section-title">Recomendador Interactivo de Palas</h2>
            <p className="section-desc">
              Descubrí qué formato, balance y núcleo se adaptan a tu juego para rendir al 100% y cuidar tu brazo.
            </p>
          </div>
        </div>

        <div className="racket-finder-grid">
          {/* CONTROLES / FILTROS */}
          <div className="racket-controls-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", marginBottom: 14 }}>
              1. Tu estilo de juego principal:
            </h3>
            <div className="racket-style-selector">
              <button
                type="button"
                className={`racket-opt-btn${playStyle === "control" ? " active" : ""}`}
                onClick={() => setPlayStyle("control")}
              >
                <span className="racket-opt-emoji">🛡️</span>
                <strong>Control &amp; Defensa</strong>
                <small>Priorizo no errar y colocar la bola</small>
              </button>

              <button
                type="button"
                className={`racket-opt-btn${playStyle === "polivalente" ? " active" : ""}`}
                onClick={() => setPlayStyle("polivalente")}
              >
                <span className="racket-opt-emoji">⚡</span>
                <strong>Polivalente / Híbrido</strong>
                <small>Defiendo y ataco con fluidez</small>
              </button>

              <button
                type="button"
                className={`racket-opt-btn${playStyle === "potencia" ? " active" : ""}`}
                onClick={() => setPlayStyle("potencia")}
              >
                <span className="racket-opt-emoji">💥</span>
                <strong>Potencia &amp; Smash</strong>
                <small>Busco definir y sacar la bola por 3</small>
              </button>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", marginTop: 22, marginBottom: 14 }}>
              2. Frecuencia y nivel de juego:
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { id: "iniciacion", label: "Iniciación", sub: "1 a 2 veces / mes" },
                { id: "intermedio", label: "Intermedio", sub: "1 a 2 veces / sem" },
                { id: "avanzado", label: "Avanzado", sub: "3+ veces / sem" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  className={`racket-lvl-btn${level === lvl.id ? " active" : ""}`}
                  onClick={() => setLevel(lvl.id)}
                >
                  <strong>{lvl.label}</strong>
                  <span>{lvl.sub}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-hairline)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={injuryHistory}
                  onChange={(e) => setInjuryHistory(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "var(--color-accent-orange)" }}
                />
                <span style={{ fontSize: 13, color: "var(--color-body)" }}>
                  ¿Tenés molestias en el codo o muñeca? (Epicondilitis)
                </span>
              </label>
              {injuryHistory && (
                <p style={{ fontSize: 12, color: "#A8501A", marginTop: 6, background: "var(--color-accent-orange-subtle)", padding: "6px 10px", borderRadius: "var(--radius-sm)" }}>
                  💡 Recomendamos balance bajo (Redonda) y goma EVA Soft con antivibradores ShockOut.
                </p>
              )}
            </div>
          </div>

          {/* DIAGRAMA VECTORIAL & FICHA TÉCNICA */}
          <div className="racket-result-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="badge-linear badge-amber">Recomendación Personalizada</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)" }}>
                Specs Oficiales
              </span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)", marginBottom: 12 }}>
              Formato: <span style={{ color: "#A8501A" }}>{current.name}</span>
            </h3>

            {/* SVG Visualizer de la pala */}
            <div className="racket-svg-wrap">
              <svg viewBox="0 0 200 240" width="140" height="170" aria-hidden="true">
                <defs>
                  <linearGradient id="racketGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffedd5" />
                    <stop offset="100%" stopColor="#fff7ed" />
                  </linearGradient>
                </defs>

                {/* Mango / Grip */}
                <rect x="90" y="160" width="20" height="70" rx="4" fill="#1B1B19" />
                <line x1="90" y1="175" x2="110" y2="175" stroke="#40444c" strokeWidth="1.5" />
                <line x1="90" y1="190" x2="110" y2="190" stroke="#40444c" strokeWidth="1.5" />
                <line x1="90" y1="205" x2="110" y2="205" stroke="#40444c" strokeWidth="1.5" />
                <line x1="90" y1="220" x2="110" y2="220" stroke="#40444c" strokeWidth="1.5" />
                {/* Cuerda de seguridad */}
                <path d="M 100 230 Q 100 240, 110 240" fill="none" stroke="#E8722A" strokeWidth="2" />

                {/* Puente corazón */}
                <path d="M 85 160 L 100 135 L 115 160 Z" fill="#ffffff" stroke="#dcdee0" strokeWidth="2" />

                {/* Cabeza según formato */}
                {playStyle === "control" && (
                  <circle cx="100" cy="85" r="55" fill="url(#racketGlow)" stroke="#E8722A" strokeWidth="3" />
                )}
                {playStyle === "polivalente" && (
                  <path d="M 100 25 C 145 25, 155 75, 135 135 C 120 150, 80 150, 65 135 C 45 75, 55 25, 100 25 Z" fill="url(#racketGlow)" stroke="#E8722A" strokeWidth="3" />
                )}
                {playStyle === "potencia" && (
                  <path d="M 100 20 L 155 45 C 160 85, 140 130, 125 145 L 75 145 C 60 130, 40 85, 45 45 Z" fill="url(#racketGlow)" stroke="#E8722A" strokeWidth="3" />
                )}

                {/* Perforaciones aerodinámicas */}
                {[-25, -12, 0, 12, 25].map((x) =>
                  [-20, -8, 4, 16].map((y) => (
                    <circle key={`${x}-${y}`} cx={100 + x} cy={85 + y} r="2.5" fill="#1B1B19" opacity="0.75" />
                  ))
                )}

                {/* Sweet Spot Highlight */}
                <circle
                  cx="100"
                  cy={playStyle === "potencia" ? 65 : playStyle === "control" ? 85 : 75}
                  r="18"
                  fill="none"
                  stroke="#E8722A"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="racket-specs-mini">
                <div className="racket-spec-row">
                  <span>Balance:</span>
                  <strong>{current.balance}</strong>
                </div>
                <div className="racket-spec-row">
                  <span>Punto Dulce:</span>
                  <strong>{current.sweetSpot}</strong>
                </div>
                <div className="racket-spec-row">
                  <span>Núcleo:</span>
                  <strong>{current.core}</strong>
                </div>
                <div className="racket-spec-row">
                  <span>Peso recomendado:</span>
                  <strong>{current.weight}</strong>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.5, margin: "16px 0", background: "var(--color-canvas-soft)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-hairline)" }}>
              {current.idealFor}
            </p>

            <button
              type="button"
              className="btn btn-linear-primary"
              onClick={shareWhatsApp}
              style={{ width: "100%", justifyContent: "center" }}
            >
              🎾 Consultar palas test en Muzzaga →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
