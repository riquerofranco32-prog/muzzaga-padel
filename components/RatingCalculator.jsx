"use client";

import { useMemo, useState } from "react";

function categoryFor(val) {
  if (val < 2.8) {
    return {
      label: "7MA CATEGORÍA (Iniciación)",
      desc: "Estás afianzando tus golpes básicos y aprendiendo a salir de pared. ¡Los partidos amistosos de 7ma son ideales para vos!",
    };
  }
  if (val >= 4.0) {
    return {
      label: "5TA / CATEGORÍA LIBRE (Avanzado)",
      desc: "Tenés potencia, lectura táctica y variantes en la red. Estás para competir en el cuadro principal de los torneos.",
    };
  }
  return {
    label: "6TA CATEGORÍA (Intermedio)",
    desc: "Tu nivel te permite competir en los torneos oficiales de 6ta categoría de Muzzaga o jugar desafíos abiertos nocturnos.",
  };
}

export default function RatingCalculator() {
  const [raw, setRaw] = useState(34);
  const val = (raw / 10).toFixed(1);
  const category = useMemo(() => categoryFor(Number(val)), [val]);
  const whatsappUrl = `https://wa.me/5492995974176?text=${encodeURIComponent(
    `¡Hola Muzzaga! Hice el test de nivel en la web y me dio ${val} (${category.label}). Quiero sumarme a los partidos abiertos.`,
  )}`;

  return (
    <div className="rating-box">
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          color: "var(--text-muted)",
          letterSpacing: "0.06em",
        }}
      >
        Tu Nivel Estimado
      </span>
      <div className="rating-display-val">{val}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        {category.label}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            display: "block",
            marginBottom: 8,
          }}
        >
          Ajustá tu nivel en pista:
        </label>
        <input
          type="range"
          min="15"
          max="55"
          value={raw}
          onChange={(e) => setRaw(Number(e.target.value))}
          aria-label="Nivel de juego estimado"
        />
      </div>

      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginBottom: 22,
          lineHeight: 1.5,
        }}
      >
        {category.desc}
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener"
        className="btn btn-linear-primary"
        style={{ width: "100%" }}
      >
        Unirme al grupo de mi nivel →
      </a>
    </div>
  );
}
