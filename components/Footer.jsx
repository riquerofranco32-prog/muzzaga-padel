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
              <div
                className="brand-mark"
                style={{ width: 24, height: 24, fontSize: 12 }}
              >
                M
              </div>
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
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <a href="#turnos" style={{ color: "var(--text-secondary)" }}>
                  Elegí tu Turno
                </a>
                <a
                  href="#canchas-abiertas"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Canchas Abiertas
                </a>
                <a href="#rating" style={{ color: "var(--text-secondary)" }}>
                  Tu Nivel
                </a>
                <a href="#torneos" style={{ color: "var(--text-secondary)" }}>
                  Torneos 2026
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
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <a
                  href="https://wa.me/5492995974176"
                  target="_blank"
                  rel="noopener"
                  style={{ color: "var(--text-secondary)" }}
                >
                  WhatsApp: +54 9 299 597-4176
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
                  style={{ color: "var(--accent-sky)" }}
                >
                  Google Maps Oficial
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 Muzzaga Pádel · Catriel, Río Negro. Todos los derechos
            reservados. ·{" "}
            <a href="/admin" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              🔒 Panel de Administración
            </a>
          </div>
          <div>2 Canchas de Cristal · Cantina Propia · Torneos Oficiales</div>
        </div>
      </div>
    </footer>
  );
}
