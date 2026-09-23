"use client";

import Image from "next/image";
import Link from "next/link";
import { useLightbox } from "./LightboxProvider";
import { CLUB_INFO } from "../data/club";

const FEATURED_PHOTOS = [
  {
    src: "/img/torneos/agosto/ganadores_1er_caballeros.jpg",
    alt: "1er puesto 7ma Caballeros, Torneo Agosto 2026",
    label: "1er Puesto Caballeros",
  },
  {
    src: "/img/torneos/agosto/ganadores_1er_damas.jpg",
    alt: "1er puesto 7ma Damas, Torneo Agosto 2026",
    label: "1er Puesto Damas",
  },
  {
    src: "/img/torneos/junio/ganadores_1er_puesto.jpg",
    alt: "1er puesto 6ta Libre (G. Salinas y F. Alcalá)",
    label: "1er Puesto 6ta Libre",
  },
  {
    src: "/img/torneos/agosto/jugadores_01.jpg",
    alt: "Partido en cancha de cristal, Torneo Agosto 2026",
    label: "Fase de Grupos",
  },
  {
    src: "/img/torneos/agosto/jugadores_06.jpg",
    alt: "Jugadores en acción, Torneo Agosto 2026",
    label: "Definición en Red",
  },
  {
    src: "/img/torneos/junio/jugadores_12.jpg",
    alt: "Punto de torneo bajo luces LED en Muzzaga",
    label: "Copa de Oro",
  },
];

export default function HomeTorneosTeaser() {
  const openLightbox = useLightbox();

  return (
    <section id="torneos" className="section-turnos" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header-row" style={{ alignItems: "center" }}>
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 6 }}>
              Competencia &amp; Comunidad
            </span>
            <h2 className="section-title">Torneos en Muzzaga</h2>
            <p className="section-desc">
              Fechas oficiales por categoría con fase de grupos, copas de oro y plata, trofeos y premios en efectivo.
            </p>
          </div>
          <div className="mascot-section-badge">
            <img
              src="/img/mascotas/muzzaguito-copa-campeon.png"
              alt="Muzzaguito Campeón con Copa de Torneo"
              width={160}
              height={160}
              className="mascot-section-img"
            />
          </div>
        </div>
        <Link href="/torneos" className="btn btn-secondary" style={{ gap: 6 }}>
          Ver galería completa y fixture →
        </Link>

        {/* CARD PROXIMO TORNEO */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(232, 114, 42, 0.08) 0%, var(--color-surface-card) 100%)",
            border: "1px solid var(--color-hairline-strong)",
            borderRadius: "var(--radius-xl)",
            padding: "24px 20px",
            marginBottom: 24,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <span className="badge-linear badge-amber" style={{ fontSize: 11, marginBottom: 6 }}>
              Inscripciones Abiertas
            </span>
            <h3 style={{ fontSize: 19, color: "var(--color-ink)", margin: "4px 0 6px" }}>
              Próximo Torneo · Categorías 7ma, 6ta y Suma 12
            </h3>
            <p style={{ color: "var(--color-body)", fontSize: 13.5, margin: 0, maxWidth: 540 }}>
              Cupos limitados por categoría. Partidos a 3 sets, tercer tiempo incluido y transmisión de finales.
            </p>
          </div>
          <a
            href={`https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent("¡Hola Muzzaga! Quiero información sobre fecha e inscripción para el próximo torneo.")}`}
            target="_blank"
            rel="noopener"
            className="btn btn-linear-primary"
            style={{ padding: "10px 20px" }}
          >
            Anotarme por WhatsApp →
          </a>
        </div>

        {/* GRILLA RESUMIDA DE 6 FOTOS */}
        <div className="torneo-thumb-grid">
          {FEATURED_PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="torneo-thumb"
              onClick={() => openLightbox(photo.src, photo.alt)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 45vw, 180px"
              />
              <div className="torneo-thumb-badge">
                <span>{photo.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/torneos" className="btn btn-secondary" style={{ padding: "10px 24px" }}>
            Ver las más de 50 fotos de torneos en la galería oficial →
          </Link>
        </div>
      </div>
    </section>
  );
}
