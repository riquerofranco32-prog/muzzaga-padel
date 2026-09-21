"use client";

import { useState } from "react";

const ALL_CATEGORIES = [
  {
    id: "7ma",
    name: "7ma Categoría",
    sub: "Iniciación & Principiantes",
    rating: "1.5 - 2.6",
    badge: "badge-emerald",
    color: "#059669",
    tagline: "El punto de partida: diversión, ritmo y control de rebote.",
    skills: [
      { name: "Saque y Devolución", level: "Básico y consistente", pct: 70 },
      { name: "Paredes de Fondo", level: "Aprendiendo lectura de rebote", pct: 45 },
      { name: "Juego en la Red", level: "Voleas de contención", pct: 50 },
      { name: "Definición / Smash", level: "Remate plano suave", pct: 30 },
    ],
    palaRecom: "Formato Redondo, balance bajo, goma EVA Soft para máximo confort y control.",
    tournaments: "Torneo Caballeros 7ma · Torneo Damas C · Americanos Express semanales",
    whatsappMsg: "¡Hola Muzzaga! Juego en 7ma Categoría. Quiero sumarme al grupo de WhatsApp de 7ma para coordinar partidos y sumarme a Canchas Abiertas.",
  },
  {
    id: "6ta",
    name: "6ta Categoría",
    sub: "Intermedio / En Crecimiento",
    rating: "2.7 - 3.8",
    badge: "badge-amber",
    color: "#ea580c",
    tagline: "Partidos parejos y dinámicos: voleas firmes, bandejas y transiciones.",
    skills: [
      { name: "Saque y Devolución", level: "Profundo con efecto", pct: 85 },
      { name: "Paredes de Fondo", level: "Salida de pared cruzada y globo", pct: 75 },
      { name: "Juego en la Red", level: "Bandejas tácticas y volea profunda", pct: 75 },
      { name: "Definición / Smash", level: "Remate colocado a la reja", pct: 60 },
    ],
    palaRecom: "Formato Lágrima o Redondo Pro, carbono 3K/12K, balance medio equilibrado.",
    tournaments: "Circuito 6ta Catriel · Desafíos de fin de semana · Torneo Parejas",
    whatsappMsg: "¡Hola Muzzaga! Soy de 6ta Categoría. Quiero sumarme al grupo de WhatsApp de 6ta para jugar partidos competitivos y torneos.",
  },
  {
    id: "5ta",
    name: "5ta Categoría",
    sub: "Intermedio Alto / Avanzado",
    rating: "3.9 - 4.8",
    badge: "badge-indigo",
    color: "#ff5e00",
    tagline: "Ritmo veloz, lectura táctica de rivales y variantes ofensivas en la red.",
    skills: [
      { name: "Saque y Devolución", level: "Agresivo buscando tomar la red", pct: 90 },
      { name: "Paredes de Fondo", level: "Doble pared, salida bajada y chiquita", pct: 85 },
      { name: "Juego en la Red", level: "Víbora con peso a la reja y bloqueo", pct: 85 },
      { name: "Definición / Smash", level: "Smash x3 metros y potencia", pct: 78 },
    ],
    palaRecom: "Formato Lágrima / Diamante, carbono 12K/18K, goma Black EVA firme.",
    tournaments: "Torneo 5ta Oficial · Suma 11 · Desafíos nocturnos de alta intensidad",
    whatsappMsg: "¡Hola Muzzaga! Juego en 5ta Categoría. Me gustaría sumarme al grupo de WhatsApp de 5ta para partidos y torneos.",
  },
  {
    id: "4ta-3ra",
    name: "4ta & 3ra Categoría",
    sub: "Competitivo / Élite Regional",
    rating: "4.9 - 5.9",
    badge: "badge-amber",
    color: "#d97706",
    tagline: "Alta competencia regional: potencia controlada, salida por 4 y juego aéreo pro.",
    skills: [
      { name: "Saque y Devolución", level: "Táctico y milimétrico", pct: 95 },
      { name: "Paredes de Fondo", level: "Manejo total de giros y dobles paredes", pct: 92 },
      { name: "Juego en la Red", level: "Voleas cortadas rasantes y rulo a la reja", pct: 92 },
      { name: "Definición / Smash", level: "Traída a campo propio y smash x3 constante", pct: 90 },
    ],
    palaRecom: "Formato Diamante / Lágrima Hard, balance alto, balance pro para máxima aceleración.",
    tournaments: "Torneo Abierto 3ra/4ta · Suma 8 · Premios en efectivo y palas pro",
    whatsappMsg: "¡Hola Muzzaga! Soy jugador de 4ta/3ra. Quiero consultar por torneos de primera categoría y partidos de nivel.",
  },
  {
    id: "damas",
    name: "Damas (Cat. A, B & C)",
    sub: "Circuito Femenino",
    rating: "2.0 - 5.0",
    badge: "badge-emerald",
    color: "#059669",
    tagline: "Comunidad femenina activa: torneos por categorías, clínicas y tercer tiempo.",
    skills: [
      { name: "Estrategia de Pareja", level: "Constancia, juego cruzado y globos", pct: 90 },
      { name: "Paredes de Cristal", level: "Paciencia y defensa sólida", pct: 85 },
      { name: "Juego en la Red", level: "Volea colocada a los espacios libres", pct: 80 },
      { name: "Tercer Tiempo", level: "Comunidad, cantina y amistad", pct: 100 },
    ],
    palaRecom: "Pesos ultralivianos (345 - 355g), balance medio-bajo, núcleos confort.",
    tournaments: "Torneo Damas Catriel A y B · Torneo Rosa · Encuentros semanales",
    whatsappMsg: "¡Hola Muzzaga! Quiero sumarme a la comunidad de Damas de Muzzaga Pádel para partidos y torneos.",
  },
  {
    id: "suma-mixto",
    name: "Suma (+8, +11, +12) & Mixtos",
    sub: "Categorías Combinadas",
    rating: "Parejas Equilibradas",
    badge: "badge-indigo",
    color: "#ff5e00",
    tagline: "La fórmula perfecta para jugar con amigos o pareja de distinto nivel.",
    skills: [
      { name: "Compensación Táctica", level: "Estrategia para potenciar a la pareja", pct: 92 },
      { name: "Cobertura de Cancha", level: "Ayudas defensivas y rotación fluida", pct: 88 },
      { name: "Fair Play & Diversión", level: "Competitividad con gran clima de club", pct: 95 },
      { name: "Definición Táctica", level: "Búsqueda del hueco sin forzar errores", pct: 85 },
    ],
    palaRecom: "Palas polivalentes adaptadas a la posición (drive o revés).",
    tournaments: "Torneo Mixto Nocturno · Torneo Suma 11/12 · Torneos de fin de mes",
    whatsappMsg: "¡Hola Muzzaga! Quiero info sobre el próximo Torneo Mixto / Suma para anotarme con mi pareja.",
  },
];

export default function CategoriesExplorer() {
  const [activeCatId, setActiveCatId] = useState("6ta");
  const current = ALL_CATEGORIES.find((c) => c.id === activeCatId) || ALL_CATEGORIES[1];

  const handleWhatsApp = () => {
    window.open(`https://wa.me/5492995974176?text=${encodeURIComponent(current.whatsappMsg)}`, "_blank");
  };

  return (
    <section id="todas-las-categorias" className="section-turnos" style={{ background: "#ffffff", borderTop: "1px solid var(--color-hairline)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Guía Oficial de Categorías en Catriel
            </span>
            <h2 className="section-title">Categorías del Pádel Argentino</h2>
            <p className="section-desc">
              Conocé en detalle qué se juega en cada nivel, qué golpes se requieren y cómo integrarte a los torneos y partidos de Muzzaga.
            </p>
          </div>
        </div>

        {/* SELECTOR DE PÍLDORAS DE CATEGORÍAS */}
        <div className="cat-selector-scroll">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                type="button"
                className={`cat-pill-btn${isActive ? " active" : ""}`}
                onClick={() => setActiveCatId(cat.id)}
              >
                <strong>{cat.name}</strong>
                <span>{cat.sub.split("/")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* TARJETA DETALLE DE CATEGORÍA */}
        <div className="cat-detail-card">
          <div className="cat-detail-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <span className={`badge-linear ${current.badge}`}>{current.rating}</span>
                <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>
                  Muzzaga Padel Ranking
                </span>
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", margin: "4px 0" }}>
                {current.name} · <span style={{ color: "var(--color-accent-orange)" }}>{current.sub}</span>
              </h3>
              <p style={{ fontSize: 15, color: "var(--color-body)", marginTop: 4 }}>
                {current.tagline}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-orange-primary cat-join-btn"
              onClick={handleWhatsApp}
            >
              📱 Sumarme a Partidos de {current.name} →
            </button>
          </div>

          <div className="cat-detail-body-grid">
            {/* HABILIDADES Y GOLPES */}
            <div className="cat-skills-box">
              <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", marginBottom: 14 }}>
                🎾 Nivel técnico de golpes en pista:
              </h4>

              <div className="cat-skills-list">
                {current.skills.map((skill, idx) => (
                  <div key={idx} className="cat-skill-item">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <strong style={{ color: "var(--color-ink)" }}>{skill.name}</strong>
                      <span style={{ color: "var(--color-body)" }}>{skill.level}</span>
                    </div>
                    <div className="cat-progress-track">
                      <div
                        className="cat-progress-fill"
                        style={{ width: `${skill.pct}%`, background: current.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SPECS, PALAS Y TORNEOS */}
            <div className="cat-info-sidebox">
              <div className="cat-info-block">
                <span className="cat-info-tag">Pala Recomendada</span>
                <p style={{ fontSize: 13.5, color: "var(--color-ink)", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {current.palaRecom}
                </p>
              </div>

              <div className="cat-info-block">
                <span className="cat-info-tag">Torneos y Competencias Activas</span>
                <p style={{ fontSize: 13.5, color: "var(--color-ink)", margin: "4px 0 0", lineHeight: 1.5 }}>
                  🏆 {current.tournaments}
                </p>
              </div>

              <div className="cat-info-block" style={{ background: "var(--color-accent-orange-subtle)", borderColor: "var(--color-accent-orange-border)" }}>
                <span className="cat-info-tag" style={{ color: "var(--color-accent-orange)" }}>Matchmaking en Catriel</span>
                <p style={{ fontSize: 13, color: "var(--color-text-link)", margin: "4px 0 0", lineHeight: 1.5 }}>
                  ¿Buscás pareja o rivales de {current.name}? Tenemos grupos activos organizados por nivel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
