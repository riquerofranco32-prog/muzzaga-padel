"use client";

import Image from "next/image";
import { useLightbox } from "./LightboxProvider";

// Estas fotos venían con <img> plano: siempre el JPEG a resolución completa,
// sin AVIF/WebP ni tamaños por dispositivo. Con next/image el navegador pide
// el tamaño que realmente necesita el card (via `sizes`) en un formato
// moderno, que es la mayor parte del peso de la home. `fill` funciona porque
// los contenedores (.marquee-card, .photo-bento-card) ya son position:relative
// con overflow:hidden.

/** Marquee card used in the hero gallery strip. */
export function MarqueeCard({ src, alt, label, caption, priority }) {
  const openLightbox = useLightbox();
  return (
    <div className="marquee-card" onClick={() => openLightbox(src, caption)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 120px, 190px"
        className="marquee-img"
        priority={Boolean(priority)}
        loading={priority ? undefined : "lazy"}
      />
      <div className="marquee-card-label">
        <span>{label}</span>
        <span className="marquee-card-dot" />
      </div>
    </div>
  );
}

/** Full-width photo tile used in the Torneos / Cantina bento grids. */
export function BentoPhotoCard({
  src,
  alt,
  caption,
  badge,
  badgeClassName,
  title,
  children,
}) {
  const openLightbox = useLightbox();
  return (
    <div
      className="photo-bento-card"
      onClick={() => openLightbox(src, caption)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
        className="photo-bento-img"
      />
      <div className="photo-bento-overlay" />
      <div className="photo-bento-body">
        {badge && (
          <span
            className={`badge-linear ${badgeClassName || ""}`}
            style={{ marginBottom: 8 }}
          >
            {badge}
          </span>
        )}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.4,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
