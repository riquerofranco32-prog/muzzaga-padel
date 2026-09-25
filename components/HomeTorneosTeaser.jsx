"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useLightbox } from "./LightboxProvider";
import { CLUB_INFO } from "../data/club";
import Mascota from "./Mascota";

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
              Torneos por categoría todo el año. Mirá las fotos de junio y agosto y anotate para el próximo.
            </p>
          </div>
          <div className="mascot-section-badge">
            <Mascota
              pose="trofeo-bolso"
              alt="Muzzaguito Campeón con Copa de Torneo"
              className="mascot-section-img"
            />
          </div>
        </div>
        {/* CARD PROXIMO TORNEO */}
        <div className="next-event">
          <div className="next-event-date" aria-hidden="true">
            <CalendarClock strokeWidth={2.2} />
            <span>Fecha</span>
          </div>
          <div className="next-event-body">
            <span className="next-event-tag">Próximo torneo</span>
            <h3 className="next-event-title">Fecha a confirmar</h3>
            <p className="next-event-desc">
              Escribinos por WhatsApp y te avisamos la fecha y las categorías apenas estén definidas.
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
          {FEATURED_PHOTOS.slice(0, 5).map((photo, i) => (
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
                // La primera ocupa dos columnas y dos filas del bento.
                sizes={i === 0 ? "(max-width: 900px) 92vw, 570px" : "(max-width: 900px) 46vw, 280px"}
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
