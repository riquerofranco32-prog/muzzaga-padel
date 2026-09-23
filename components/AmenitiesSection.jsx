"use client";

import { useState } from "react";
import Image from "next/image";
import FeatureCarousel from "./FeatureCarousel";

const SPECS = [
  {
    id: "cristal",
    title: "Cristales Templados 10mm",
    subtitle: "Rebote uniforme y seguridad",
    icon: "💎",
    tag: "Homologado FAP",
    desc: "Vidrios templados de alta resistencia con fijaciones perimetrales antivibración. Garantizan un rebote fiel, predecible y continuo tanto en pared de fondo como en ángulos laterales.",
  },
  {
    id: "cesped",
    title: "Césped Sintético Monofilamento",
    subtitle: "Tracción constante sin resbalones",
    icon: "🌱",
    tag: "Arena de Sílice 100%",
    desc: "Superficie de fibra texturada de 12mm de alta densidad lastrada con arena de sílice calibrada para máxima adherencia en giros bruscos y amortiguación articular en rodillas.",
  },
  {
    id: "led",
    title: "Iluminación LED Pro 200W",
    subtitle: "Visibilidad perfecta de noche",
    icon: "💡",
    tag: "8 Proyectores",
    desc: "Proyectores LED simétricos de alta potencia ubicados a 6 metros de altura. Cobertura uniforme en toda la pista sin conos de sombra ni encandilamiento en globos altos.",
  },
  {
    id: "cantina",
    title: "Cantina & Tercer Tiempo",
    subtitle: "El encuentro después de cada set",
    icon: "🍕",
    tag: "Menú Completo",
    desc: "Área social con mesas, pantalla grande para seguir partidos y torneos, pizzas caseras, bebidas frías y opciones SIN TACC / veganas para disfrutar el post partido.",
  },
];

export default function AmenitiesSection() {
  const [selectedSpec, setSelectedSpec] = useState(SPECS[0].id);

  const active = SPECS.find((s) => s.id === selectedSpec) || SPECS[0];

  return (
    <section id="instalaciones" className="section-bento">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span
              className="badge-linear badge-emerald"
              style={{ marginBottom: 8 }}
            >
              Instalaciones Profesionales
            </span>
            <h2 className="section-title">
              Todo lo que necesitás para jugar al mejor nivel
            </h2>
            <p className="section-desc">
              Diseñado de cero para brindar la mejor experiencia deportiva y
              social de Catriel.
            </p>
          </div>
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <Image
              src="/img/mascotas/muzzaguito-mochila.png"
              alt="Muzzaguito equipado con paletero profesional"
              width={92}
              height={92}
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.14))",
              }}
            />
          </div>
        </div>

        <FeatureCarousel />

        {/* FICHA TÉCNICA INTERACTIVA DE PISTAS */}
        <div
          style={{
            marginTop: 28,
            background: "var(--color-surface-card, #ffffff)",
            border: "1px solid var(--color-hairline-strong, #e2e8f0)",
            borderRadius: "var(--radius-xl, 16px)",
            padding: "24px 20px",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-accent-orange, #e8722a)",
                }}
              >
                Ficha Técnica Oficial
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", color: "var(--color-ink)" }}>
                Especificaciones de las Pistas de Muzzaga
              </h3>
            </div>

            {/* TABS SELECTORAS */}
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "var(--color-surface-2, #f4f4f5)",
                padding: 4,
                borderRadius: "var(--radius-md, 10px)",
                flexWrap: "wrap",
              }}
            >
              {SPECS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSpec(s.id)}
                  style={{
                    border: "none",
                    background: selectedSpec === s.id ? "#ffffff" : "transparent",
                    color: selectedSpec === s.id ? "var(--color-ink)" : "var(--text-secondary)",
                    fontWeight: selectedSpec === s.id ? 600 : 500,
                    fontSize: 12.5,
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    boxShadow: selectedSpec === s.id ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.title.split(" ")[0]} {s.title.split(" ")[1] || ""}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DETALLE ACTIVO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 16,
              alignItems: "center",
              padding: "16px 18px",
              background: "var(--color-surface-2, #fafafa)",
              borderRadius: "var(--radius-md, 12px)",
              border: "1px solid var(--color-hairline, #eee)",
            }}
          >
            <div
              style={{
                fontSize: 32,
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {active.icon}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <strong style={{ fontSize: 16, color: "var(--color-ink)" }}>
                  {active.title}
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#059669",
                    background: "rgba(16, 185, 129, 0.1)",
                    padding: "2px 8px",
                    borderRadius: 12,
                  }}
                >
                  ✓ {active.tag}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                {active.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
