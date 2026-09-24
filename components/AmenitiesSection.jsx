"use client";

import { useState } from "react";
import Image from "next/image";
import FeatureCarousel from "./FeatureCarousel";

const SPECS = [
  {
    id: "cristal",
    short: "Cristales",
    title: "Cristales Templados 10mm",
    subtitle: "Rebote uniforme y seguridad",
    icon: "💎",
    tag: "Homologado FAP",
    desc: "Vidrios templados de alta resistencia con fijaciones perimetrales antivibración. Garantizan un rebote fiel, predecible y continuo tanto en pared de fondo como en ángulos laterales.",
  },
  {
    id: "cesped",
    short: "Césped",
    title: "Césped Sintético Monofilamento",
    subtitle: "Tracción constante sin resbalones",
    icon: "🌱",
    tag: "Arena de Sílice 100%",
    desc: "Superficie de fibra texturada de 12mm de alta densidad lastrada con arena de sílice calibrada para máxima adherencia en giros bruscos y amortiguación articular en rodillas.",
  },
  {
    id: "led",
    short: "Iluminación",
    title: "Iluminación LED Pro 200W",
    subtitle: "Visibilidad perfecta de noche",
    icon: "💡",
    tag: "8 Proyectores",
    desc: "Proyectores LED simétricos de alta potencia ubicados a 6 metros de altura. Cobertura uniforme en toda la pista sin conos de sombra ni encandilamiento en globos altos.",
  },
  {
    id: "cantina",
    short: "Cantina",
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
          <div className="mascot-section-badge">
            <Image
              src="/img/mascotas/muzzaguito-descanso-mate.webp"
              alt="Muzzaguito descansando con mate y su paletero"
              width={720}
              height={710}
              sizes="(max-width: 768px) 136px, 290px"
              className="mascot-section-img"
            />
          </div>
        </div>

        <FeatureCarousel />

        {/* FICHA TÉCNICA INTERACTIVA DE PISTAS */}
        <div className="spec-panel">
          <div className="spec-panel-head">
            <div>
              <span className="spec-eyebrow">Ficha Técnica Oficial</span>
              <h3 className="spec-heading">Especificaciones de las pistas</h3>
            </div>

            <div className="spec-tabs" role="tablist" aria-label="Especificaciones">
              {SPECS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedSpec === s.id}
                  className="spec-tab"
                  onClick={() => setSelectedSpec(s.id)}
                >
                  <span aria-hidden="true">{s.icon}</span>
                  <span>{s.short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* key: re-monta el detalle para que la animación de entrada corra en cada cambio */}
          <div className="spec-detail" key={active.id} role="tabpanel">
            <div className="spec-icon" aria-hidden="true">{active.icon}</div>
            <div>
              <div className="spec-title-row">
                <strong>{active.title}</strong>
                <span className="spec-tag">✓ {active.tag}</span>
              </div>
              <p className="spec-desc">{active.desc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
