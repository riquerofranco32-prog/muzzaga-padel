"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#turnos", label: "Turnos" },
  { href: "#canchas-abiertas", label: "Abiertas" },
  { href: "#marcador-en-vivo", label: "Marcador" },
  { href: "#buscador-palas", label: "Palas" },
  { href: "#pizarra-tactica", label: "Táctica" },
  { href: "#split-cost", label: "Dividir Gastos" },
  { href: "#generador-americano", label: "Americano" },
  { href: "#cantina", label: "Cantina" },
  { href: "#ubicacion", label: "Ubicación" },
];

const MAPS_URL = "https://maps.app.goo.gl/kR1h9mhdLqGLKatV7";
const WHATSAPP_URL = "https://wa.me/5492995974176";

const MapPinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="app-top-nav">
        <div className="container nav-inner">
          <a
            href="#top"
            className="brand-group"
            aria-label="Muzzaga Pádel Catriel"
          >
            <div className="brand-mark">M</div>
            <div>
              <span className="brand-text">Muzzaga</span>
              <span className="brand-sub">Catriel</span>
            </div>
          </a>

          <nav className="nav-links-row" aria-label="Navegación">
            {NAV_LINKS.map((link) => (
              <a key={link.href} className="nav-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary header-maps-btn"
              style={{ height: 36, padding: "6px 14px", gap: 6 }}
            >
              <MapPinIcon /> Google Maps
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              className="btn btn-linear-primary"
              style={{ height: 36, padding: "6px 14px" }}
            >
              WhatsApp Club
            </a>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setOpen((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={open}
              aria-controls="mobile-nav-panel"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-nav-panel"
        className={`mobile-nav-panel${open ? " open" : ""}`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            className="mobile-nav-link"
            href={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          className="mobile-nav-link"
          href={MAPS_URL}
          target="_blank"
          rel="noopener"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <MapPinIcon /> Google Maps
        </a>
        <a
          className="mobile-nav-link"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener"
          style={{ color: "var(--color-accent-orange)", fontWeight: 600 }}
        >
          WhatsApp Club →
        </a>
      </div>
      <div
        id="mobile-nav-backdrop"
        className={`mobile-nav-backdrop${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
