import Header from "../components/Header";
import HeroMarquee from "../components/HeroMarquee";
import LiveWeatherRadar from "../components/LiveWeatherRadar";
import BookingCalendar from "../components/BookingCalendar";
import AmenitiesSection from "../components/AmenitiesSection";
import SplitCostCalculator from "../components/SplitCostCalculator";
import CommunityMatchesSection from "../components/CommunityMatchesSection";
import TacticalCourtSimulator from "../components/TacticalCourtSimulator";
import AmericanoGenerator from "../components/AmericanoGenerator";
import RatingCalculator from "../components/RatingCalculator";
import CantinaSection from "../components/CantinaSection";
import TorneosGallery from "../components/TorneosGallery";
import FaqSection from "../components/FaqSection";
import FloatingLiveBar from "../components/FloatingLiveBar";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";

import { priceForSlot } from "../lib/booking";

const WHATSAPP = "5492995974176";

export default function Home() {
  return (
    <>
      <Header />

      <div className="glow-ambient glow-hero-top" />

      {/* HERO */}
      <section id="top" className="animated-marquee-hero">
        <div className="hero-bg-photo" aria-hidden="true">
          <img
            src="/img/court_glass_night_match.jpg"
            alt="Partido de pádel nocturno en cancha de cristal con iluminación LED en Muzzaga"
          />
        </div>
        <div className="hero-inner-content">
          <LiveWeatherRadar />

          <div
            className="hero-logo-wrap"
            style={{
              margin: "20px 0 12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="/img/logo_full.png"
              alt="Muzzaga - más que pádel"
              style={{
                height: 90,
                width: "auto",
                maxWidth: "85vw",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <h1 className="hero-display-title">
            Reservá tu cancha.
            <br />
            <span className="gradient-accent">Pádel de verdad.</span>
          </h1>

          <p className="hero-description-text">
            Reservá turnos de 90 minutos con iluminación LED, sumate a Canchas
            Abiertas comunitarias y disfrutá del mejor tercer tiempo en nuestra
            cantina.
          </p>

          <div className="hero-cta-buttons">
            <a href="#turnos" className="hero-cta-main">
              Ver Turnos Disponibles ↓
            </a>
            <a href="#canchas-abiertas" className="hero-link-canchas">
              Canchas Abiertas →
            </a>
          </div>
        </div>

        <HeroMarquee />
      </section>

      {/* TURNOS */}
      <section id="turnos" className="section-turnos">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Reservá tu cancha</h2>
              <p className="section-desc">
                Mirá disponibilidad real, elegí día y horario, y confirmá tu
                turno.
              </p>
            </div>
            {(() => {
              const pricing = priceForSlot();
              return (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "right",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                    ${pricing.total.toLocaleString("es-AR")} por turno (90 min)
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--color-muted)" }}>
                    ${pricing.perPlayer.toLocaleString("es-AR")} por jugador si
                    son cuatro
                  </div>
                </div>
              );
            })()}
          </div>

          <BookingCalendar />
        </div>
      </section>

      {/* INSTALACIONES & SERVICIOS */}
      <AmenitiesSection />

      {/* CALCULADORA SPLIT COST & 3ER TIEMPO */}
      <SplitCostCalculator />

      {/* CANCHAS ABIERTAS INTERACTIVAS */}
      <CommunityMatchesSection />

      {/* RATING */}
      <section id="rating" className="section-rating">
        <div className="container">
          <div className="rating-grid-layout">
            <div>
              <h2 className="section-title">
                Calculá tu nivel
                <br />
                de juego
              </h2>
              <p
                className="section-desc"
                style={{ marginTop: 10, marginBottom: 24 }}
              >
                Mapeamos la escala internacional de nivel (1.0 a 7.0) con las
                categorías del pádel argentino (7ma a 1ra) para que siempre
                compitas de igual a igual.
              </p>

              <div className="rating-category-card">
                <div>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    7ma Categoría · Iniciación
                  </strong>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Golpes de fondo, aprendiendo rebote en paredes.
                  </span>
                </div>
                <span className="badge-linear badge-emerald">1.5 - 2.5</span>
              </div>

              <div className="rating-category-card">
                <div>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    6ta Categoría · Intermedio
                  </strong>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Voleas consistentes, salida de pared y bandeja.
                  </span>
                </div>
                <span className="badge-linear badge-amber">3.0 - 3.8</span>
              </div>

              <div className="rating-category-card">
                <div>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      display: "block",
                      fontSize: 15,
                    }}
                  >
                    5ta / Libre · Avanzado
                  </strong>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Juego táctico veloz, smash definitorio por 3.
                  </span>
                </div>
                <span className="badge-linear badge-indigo">4.0 - 5.5+</span>
              </div>
            </div>

            <RatingCalculator />
          </div>
        </div>
      </section>

      {/* PIZARRA TÁCTICA INTERACTIVA */}
      <TacticalCourtSimulator />

      {/* TORNEOS */}
      <TorneosGallery />

      {/* GENERADOR DE TORNEO AMERICANO EXPRESS */}
      <AmericanoGenerator />

      {/* CANTINA */}
      <CantinaSection />

      {/* PREGUNTAS FRECUENTES */}
      <FaqSection />

      {/* UBICACIÓN */}
      <section id="ubicacion" className="section-turnos">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Cómo Llegar al Club</h2>
              <p className="section-desc">
                Muzzaga Pádel está ubicado en Catriel, Río Negro.
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/kR1h9mhdLqGLKatV7"
              target="_blank"
              rel="noopener"
              className="btn btn-secondary-maps"
              style={{ gap: 8 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EA4335"
                />
                <circle cx="12" cy="9" r="2.8" fill="#ffffff" />
              </svg>
              <span className="maps-text">Abrir en Google Maps →</span>
            </a>
          </div>

          <div className="map-frame-wrap">
            <iframe
              title="Mapa de Muzzaga Pádel en Catriel"
              src="https://maps.google.com/maps?q=-37.8832905,-67.8005469&hl=es&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                pointerEvents: "none",
              }}
            >
              <a
                href="https://maps.app.goo.gl/kR1h9mhdLqGLKatV7"
                target="_blank"
                rel="noopener"
                className="btn btn-secondary-maps"
                style={{ pointerEvents: "auto", height: 38, gap: 8 }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="#EA4335"
                  />
                  <circle cx="12" cy="9" r="2.8" fill="#ffffff" />
                </svg>
                <span className="maps-text">Abrir en Google Maps</span>
              </a>
              <a
                href="https://waze.com/ul?ll=-37.8832905,-67.8005469&navigate=yes"
                target="_blank"
                rel="noopener"
                className="btn btn-secondary"
                style={{ pointerEvents: "auto", height: 38, gap: 6 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                Navegar con Waze
              </a>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: 16,
            }}
          >
            <a
              href="https://maps.app.goo.gl/kR1h9mhdLqGLKatV7"
              target="_blank"
              rel="noopener"
              className="info-link-card"
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      fill="#EA4335"
                    />
                    <circle cx="12" cy="9" r="2.8" fill="#ffffff" />
                  </svg>
                  <span style={{ color: "#EA4335" }}>Google Maps</span> ·
                  Ubicación Oficial
                </span>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: 4,
                  }}
                >
                  Muzzaga Pádel
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Catriel, Río Negro
                </span>
              </div>
              <span style={{ fontSize: 18, color: "#EA4335" }}>↗</span>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener"
              className="info-link-card"
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="#25D366"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z" />
                  </svg>
                  <span style={{ color: "#25D366" }}>WhatsApp</span> · Atención
                  Directa
                </span>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: 4,
                  }}
                >
                  WhatsApp del Club
                </div>
                <span
                  style={{ fontSize: 13, color: "#25D366", fontWeight: 600 }}
                >
                  +54 9 299 597-4176
                </span>
              </div>
              <span style={{ fontSize: 18, color: "#25D366" }}>↗</span>
            </a>
          </div>
        </div>
      </section>

      <FloatingLiveBar />
      <Footer />
      <BottomNav />
      <ScrollReveal />
    </>
  );
}
