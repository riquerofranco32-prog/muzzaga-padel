"use client";

import { useState } from "react";
import Image from "next/image";
import FeatureCarousel from "./FeatureCarousel";

// Solo lo que se puede afirmar sin la ficha técnica del club: el espesor
// del cristal, la homologación, el césped y los proyectores quedan afuera
// hasta que el club los confirme.
const SPECS = [
  {
    id: "cristal",
    short: "Cristales",
    title: "Cristal templado",
    subtitle: "Rebote parejo",
    icon: "💎",
    tag: "Las dos canchas",
    desc: "Paredes de cristal templado en las dos canchas: el rebote es parejo en el fondo y en los laterales.",
  },
  {
    id: "cesped",
    short: "Césped",
    title: "Césped sintético",
    subtitle: "Buen agarre",
    icon: "🌱",
    tag: "Las dos canchas",
    desc: "Césped sintético para frenar, girar y arrancar sin resbalarte.",
  },
  {
    id: "led",
    short: "Iluminación",
    title: "Iluminación LED",
    subtitle: "Para jugar de noche",
    icon: "💡",
    tag: "Turnos de noche",
    desc: "Iluminación LED en las dos canchas para jugar de noche, hasta el último turno.",
  },
  {
    id: "cantina",
    short: "Cantina",
    title: "Cantina y tercer tiempo",
    subtitle: "Después de cada partido",
    icon: "🍕",
    tag: "Menú completo",
    desc: "Mesas, pantalla grande para seguir partidos y torneos, pizzas caseras, bebidas frías y opciones sin TACC para después del partido.",
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
