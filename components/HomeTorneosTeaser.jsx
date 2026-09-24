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
              src="/img/mascotas/muzzaguito-trofeo-bolso.webp"
              alt="Muzzaguito Campeón con Copa de Torneo"
              width={160}
              height={160}
              className="mascot-section-img"
            />
          </div>
        </div>
        {/* CARD PROXIMO TORNEO */}
        <div className="next-event">
          <div className="next-event-date" aria-hidden="true">
            <span>Próxima</span>
            <strong>Fecha</strong>
          </div>
          <div className="next-event-body">
            <span className="next-event-tag">Inscripciones abiertas</span>
            <h3 className="next-event-title">Categorías 7ma, 6ta y Suma 12</h3>
            <p className="next-event-desc">
              Cupos limitados por categoría. Partidos a 3 sets, tercer tiempo incluido y transmisión de finales.
            </p>
          </div>
          <a
            href={`https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent("¡Hola Muzzaga! Quiero información sobre fecha e inscripción para el próximo torneo.")}`}
            target="_blank"
            rel="noopener"
            className="next-event-cta"
          >
            Anotarme por WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* GRILLA RESUMIDA DE 6 FOTOS */}
        <div className="torneo-thumb-grid torneo-bento">
          {FEATURED_PHOTOS.slice(0, 5).map((photo) => (
            <button
              type="button"
              key={photo.src}
              className="torneo-thumb"
              onClick={() => openLightbox(photo.src, photo.alt)}
              aria-label={`Ampliar foto: ${photo.label}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 45vw, 360px"
              />
              <div className="torneo-thumb-badge">
                <span>{photo.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="section-more">
          <Link href="/torneos" className="section-more-link">
            Ver galería completa y fixture <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
