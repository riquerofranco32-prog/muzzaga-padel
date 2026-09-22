import Image from "next/image";
import Header from "../components/Header";
import LiveWeatherRadar from "../components/LiveWeatherRadar";
import TodayFlashSlots from "../components/TodayFlashSlots";
import BookingCalendar from "../components/BookingCalendar";
import AmenitiesSection from "../components/AmenitiesSection";
import CommunityMatchesSection from "../components/CommunityMatchesSection";
import HomeTorneosTeaser from "../components/HomeTorneosTeaser";
import HomeCantinaTeaser from "../components/HomeCantinaTeaser";
import ClubToolsSection from "../components/ClubToolsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import FaqSection from "../components/FaqSection";
import FloatingLiveBar from "../components/FloatingLiveBar";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import ScrollProgress from "../components/ScrollProgress";

import { priceForSlot } from "../lib/booking";
import { CLUB_INFO } from "../data/club";
import { FAQS } from "../data/faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Home() {
  const pricing = priceForSlot();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ScrollProgress />
      <Header />

      <div className="glow-ambient glow-hero-top" />

      {/* 1. HERO COMPACTO */}
      <section id="top" className="animated-marquee-hero" style={{ paddingBottom: 28 }}>
        <div className="hero-bg-photo" aria-hidden="true">
          <Image
            src="/img/court_glass_night_match.jpg"
            alt="Partido de pádel nocturno en cancha de cristal con iluminación LED en Muzzaga"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-inner-content">
          <LiveWeatherRadar />

          <div
            className="hero-logo-wrap"
            style={{
              margin: "14px 0 8px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="/img/logo_full.png"
              alt="Muzzaga Pádel - Catriel"
              style={{
                height: 68,
                width: "auto",
                maxWidth: "80vw",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <h1 className="hero-display-title" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: 12 }}>
            Canchas de Pádel en Catriel.
            <br />
            <span className="gradient-accent">Pádel de verdad.</span>
          </h1>

          <p className="hero-description-text" style={{ maxWidth: 580, margin: "0 auto 18px", fontSize: "15px" }}>
            2 canchas oficiales de cristal con iluminación LED, turnos de 90 minutos,
            Canchas Abiertas comunitarias y cantina para el mejor tercer tiempo.
          </p>

          <div className="hero-cta-buttons" style={{ marginBottom: 12 }}>
            <a href="#turnos" className="hero-cta-main" style={{ padding: "12px 28px" }}>
              Reservar Turno ↓
            </a>
            <a href="#canchas-abiertas" className="hero-link-canchas" style={{ padding: "12px 22px" }}>
              Canchas Abiertas →
            </a>
          </div>

          {/* Microcopy de confianza */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.8)",
              marginTop: 10,
            }}
          >
            <span>✓ Confirmás por WhatsApp</span>
            <span>·</span>
            <span>✓ Seña fácil por Mercado Pago</span>
            <span>·</span>
            <span>✓ Cancelás hasta 4h antes</span>
          </div>
        </div>
      </section>

      {/* WIDGET DISPONIBILIDAD INMEDIATA (HOY / MAÑANA) */}
      <TodayFlashSlots />

      {/* 2. RESERVÁ TU TURNO */}
      <section id="turnos" className="section-turnos">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
                Disponibilidad Real
              </span>
              <h2 className="section-title">Reservá tu Cancha</h2>
              <p className="section-desc">
                Elegí día y horario en tiempo real y confirmá tu turno al instante.
              </p>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                textAlign: "right",
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: 14 }}>
                ${pricing.total.toLocaleString("es-AR")} por turno (90 min)
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                ${pricing.perPlayer.toLocaleString("es-AR")} por jugador si son cuatro
              </div>
            </div>
          </div>

          <BookingCalendar />
        </div>
      </section>

      {/* 3. NÚMEROS Y PRUEBA SOCIAL */}
      <div className="container" style={{ margin: "20px auto 10px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-hairline-strong)",
            borderRadius: "var(--radius-xl)",
            padding: "24px 20px",
            textAlign: "center",
          }}
        >
          <div>
            <strong style={{ fontSize: 28, color: "var(--color-accent-orange)", display: "block" }}>
              2 Canchas
            </strong>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Cristal oficial de 10mm
            </span>
          </div>
          <div>
            <strong style={{ fontSize: 28, color: "var(--color-accent-orange)", display: "block" }}>
              12+ Torneos
            </strong>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Disputados con gran convocatoria
            </span>
          </div>
          <div>
            <strong style={{ fontSize: 28, color: "var(--color-accent-orange)", display: "block" }}>
              +800 Jugadores
            </strong>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              En la comunidad de Catriel
            </span>
          </div>
          <div>
            <strong style={{ fontSize: 28, color: "var(--color-accent-orange)", display: "block" }}>
              Cantina Propia
            </strong>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Para el mejor tercer tiempo
            </span>
          </div>
        </div>
      </div>

      <TestimonialsSection />

      {/* 4. INSTALACIONES */}
      <AmenitiesSection />

      {/* 5. CANCHAS ABIERTAS */}
      <CommunityMatchesSection />

      {/* 6. TORNEOS DESTACADOS */}
      <HomeTorneosTeaser />

      {/* 7. CANTINA DESTACADA */}
      <HomeCantinaTeaser />

      {/* 8. HERRAMIENTAS DEL CLUB */}
      <ClubToolsSection />

      {/* 9. FAQ */}
      <FaqSection />

      {/* 10. UBICACIÓN Y CONTACTO */}
      <section id="ubicacion" className="section-turnos">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge-linear badge-emerald" style={{ marginBottom: 8 }}>
                Cómo Llegar
              </span>
              <h2 className="section-title">Ubicación y Horarios</h2>
              <p className="section-desc">
                Av. Cacique Catriel y Córdoba, Catriel, Río Negro. Lunes a Sábado de 14:00 a 00:30 hs.
              </p>
            </div>
            <a
              href={CLUB_INFO.mapsUrl}
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
                href={CLUB_INFO.mapsUrl}
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
                href={CLUB_INFO.wazeUrl}
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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: 16,
            }}
          >
            <a
              href={CLUB_INFO.mapsUrl}
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
                  Av. Cacique Catriel y Córdoba · Catriel
                </span>
              </div>
              <span style={{ fontSize: 18, color: "#EA4335" }}>↗</span>
            </a>

            <a
              href={`https://wa.me/${CLUB_INFO.phoneRaw}`}
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
                  <span style={{ color: "#25D366" }}>WhatsApp</span> · Atención Directa
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
                  {CLUB_INFO.phoneFormatted}
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
