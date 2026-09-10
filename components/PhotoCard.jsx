"use client";

import { useLightbox } from "./LightboxProvider";

/** Marquee card used in the hero gallery strip. */
export function MarqueeCard({ src, alt, label, caption, priority }) {
  const openLightbox = useLightbox();
  return (
    <div className="marquee-card" onClick={() => openLightbox(src, caption)}>
      <img
        src={src}
        alt={alt}
        className="marquee-img"
        loading={priority ? "eager" : "lazy"}
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
      <img src={src} alt={alt} className="photo-bento-img" />
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
