import Image from "next/image";

const GoogleMapsIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
    <circle cx="12" cy="9" r="2.8" fill="#ffffff" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Image
                src="/img/logo_badge.png"
                alt="Muzzaga Pádel"
                width={32}
                height={32}
                style={{ width: 32, height: 32, objectFit: "contain", display: "block" }}
              />
              <strong style={{ fontSize: 16, color: "var(--text-primary)" }}>
                Muzzaga Pádel
              </strong>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                maxWidth: 340,
              }}
            >
              Club de pádel en Catriel, Río Negro. Canchas de cristal
              profesionales, torneos y cantina propia.
            </p>

            <div className="footer-mascot-box">
              <img
                src="/img/mascotas/muzzaguito-mochila-pulgar.webp"
                alt="Muzzaguito con su mochila haciendo pulgar arriba"
                width={720}
                height={672}
                loading="lazy"
                decoding="async"
                className="footer-mascot"
              />
              <span className="footer-mascot-text">
                ¡Nos vemos en la pista! 🎾 Muzzaguito te acompaña en cada partido.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 12,
                  letterSpacing: "0.04em",
                }}
              >
                Navegación
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0,
                  fontSize: 14,
                }}
              >
                <a href="/#turnos" style={{ color: "var(--text-secondary)" }}>
                  Elegí tu Turno
                </a>
                <a
                  href="/#canchas-abiertas"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Canchas Abiertas
                </a>
                <a href="/torneos" style={{ color: "var(--text-secondary)" }}>
                  Torneos Oficiales
                </a>
                <a href="/menu" style={{ color: "var(--text-secondary)" }}>
                  Menú de Cantina
                </a>
                <a
                  href="/herramientas/dividir-gastos"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Herramientas para Jugadores
                </a>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 12,
                  letterSpacing: "0.04em",
                }}
              >
                Contacto
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0,
                  fontSize: 14,
                }}
              >
                <a
                  href="https://wa.me/5492995974176"
                  target="_blank"
                  rel="noopener"
                  className="whatsapp-text"
                >
                  <WhatsAppIcon /> WhatsApp: +54 9 299 597-4176
                </a>
                <a
                  href="https://instagram.com/muzzagapadel"
                  target="_blank"
                  rel="noopener"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Instagram: @muzzagapadel
                </a>
                <a
                  href="https://maps.app.goo.gl/kR1h9mhdLqGLKatV7"
                  target="_blank"
                  rel="noopener"
                  className="maps-text"
                >
                  <GoogleMapsIcon /> Google Maps Oficial
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 Muzzaga Pádel · Catriel, Río Negro. Todos los derechos
            reservados.
          </div>
          <div>
            2 Canchas de Cristal · Cantina Propia · Iluminación LED
          </div>
        </div>
      </div>
    </footer>
  );
}
