"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#turnos", label: "Turnos" },
  { href: "#canchas-abiertas", label: "Abiertas" },
  { href: "#pizarra-tactica", label: "Táctica" },
  { href: "#split-cost", label: "Dividir Gastos" },
  { href: "#torneos", label: "Torneos" },
  { href: "#generador-americano", label: "Americano" },
  { href: "#cantina", label: "Cantina" },
  { href: "#ubicacion", label: "Ubicación" },
];

const MAPS_URL = "https://maps.app.goo.gl/kR1h9mhdLqGLKatV7";
const WHATSAPP_URL = "https://wa.me/5492995974176";

const GoogleMapsIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="#EA4335"
    />
    <circle cx="12" cy="9" r="2.8" fill="#ffffff" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
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
            <img
              src="/img/logo_badge.png"
              alt="Muzzaga Pádel"
              width={34}
              height={34}
              style={{
                width: 34,
                height: 34,
                objectFit: "contain",
                display: "block",
              }}
            />
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
              className="btn btn-secondary-maps header-maps-btn"
              style={{ height: 36, padding: "6px 14px", gap: 6 }}
            >
              <GoogleMapsIcon /> Google Maps
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary-whatsapp header-whatsapp-btn"
              style={{ height: 36, padding: "6px 14px", gap: 6 }}
            >
              <WhatsAppIcon /> WhatsApp Club
            </a>
            <a
              href="/admin"
              className="btn btn-secondary header-admin-btn"
              style={{ height: 36, padding: "6px 12px", fontSize: 13 }}
              title="Panel de Administración"
            >
              Admin
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
          className="mobile-nav-link maps-text"
          href={MAPS_URL}
          target="_blank"
          rel="noopener"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <GoogleMapsIcon /> Google Maps
        </a>
        <a
          className="mobile-nav-link whatsapp-text"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <WhatsAppIcon /> WhatsApp Club →
        </a>
        <a
          className="mobile-nav-link"
          href="/admin"
          onClick={() => setOpen(false)}
          style={{
            fontSize: 13,
            color: "var(--color-muted)",
            borderTop: "1px solid var(--color-hairline)",
            paddingTop: 14,
            marginTop: 8,
          }}
        >
          Acceso Administración
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
