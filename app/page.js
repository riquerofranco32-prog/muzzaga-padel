import Header from "../components/Header";
import HeroMarquee from "../components/HeroMarquee";
import LiveWeatherRadar from "../components/LiveWeatherRadar";
import BookingCalendar from "../components/BookingCalendar";
import AmenitiesSection from "../components/AmenitiesSection";
import SplitCostCalculator from "../components/SplitCostCalculator";
import CommunityMatchesSection from "../components/CommunityMatchesSection";
import TacticalCourtSimulator from "../components/TacticalCourtSimulator";
import PadelScoreboardLive from "../components/PadelScoreboardLive";
import AmericanoGenerator from "../components/AmericanoGenerator";
import RacketFinderQuiz from "../components/RacketFinderQuiz";
import RatingCalculator from "../components/RatingCalculator";
import CantinaSection from "../components/CantinaSection";
import TestimonialsSection from "../components/TestimonialsSection";
import FaqSection from "../components/FaqSection";
import { BentoPhotoCard } from "../components/PhotoCard";
import FloatingLiveBar from "../components/FloatingLiveBar";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";

const WHATSAPP = "5492995974176";

export default function Home() {
  return (
    <>
      <Header />

      <div className="glow-ambient glow-hero-top" />

      {/* HERO */}
      <section id="top" className="animated-marquee-hero">
        <div className="hero-bg-photo" aria-hidden="true">
          <img src="/img/match_action_led.jpg" alt="" />
        </div>
        <div className="hero-inner-content">
          <LiveWeatherRadar />

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
            <a href="#turnos" className="btn btn-linear-primary">
              Ver Turnos Disponibles ↓
            </a>
            <a href="#canchas-abiertas" className="btn btn-secondary">
              Canchas Abiertas{" "}
              <span className="badge-count">sumate a un partido</span>
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
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              $15.000 por jugador · $60.000 cancha completa
            </div>
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
      <section id="torneos" className="section-bento">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Torneos en Muzzaga</h2>
              <p className="section-desc">
                Torneos organizados durante todo el año, en todas las
                categorías. Consultá fechas y premios por WhatsApp.
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                "Hola Muzzaga! Quiero inscribir mi pareja al próximo torneo.",
              )}`}
              target="_blank"
              rel="noopener"
              className="btn btn-linear-primary"
            >
              Inscribir mi pareja →
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <BentoPhotoCard
              src="/img/court_spectators.jpg"
              alt="Ambiente de partido en Muzzaga Pádel"
              caption="Ambiente de partido en Muzzaga Pádel"
              badge="Ambiente de Club"
              title="Se juega y se mira en Muzzaga"
            >
              Compañeros y amigos siguiendo el partido desde los bancos de la
              pista.
            </BentoPhotoCard>

            <BentoPhotoCard
              src="/img/match_action_led.jpg"
              alt="Final de torneo nocturno en Muzzaga"
              caption="Final de torneo nocturno con iluminación LED"
              badge="Finales Nocturnas"
              badgeClassName="badge-amber"
              title="Partidos definitorios con luz LED"
            >
              Juego nocturno en las dos canchas de cristal.
            </BentoPhotoCard>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 22,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <span className="badge-linear badge-emerald">
                Sexta / Séptima
              </span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "6px 0",
                }}
              >
                Torneo Caballeros
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginBottom: 14,
                }}
              >
                Categorías de iniciación e intermedias, todo el año.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  "Hola Muzzaga! Quiero info del próximo torneo de caballeros.",
                )}`}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent-sky)",
                }}
              >
                Consultar fecha y cupos →
              </a>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 22,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <span className="badge-linear badge-amber">Categoría Libre</span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "6px 0",
                }}
              >
                Torneo Libre
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginBottom: 14,
                }}
              >
                Para el nivel más competitivo del club.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  "Hola Muzzaga! Quiero info del próximo torneo de libre.",
                )}`}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent-sky)",
                }}
              >
                Consultar fecha y cupos →
              </a>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 22,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <span className="badge-linear badge-emerald">Damas</span>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "6px 0",
                }}
              >
                Torneo Damas
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  marginBottom: 14,
                }}
              >
                Categorías A y B, con cuadro de eliminación.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  "Hola Muzzaga! Quiero info del próximo torneo de damas.",
                )}`}
                target="_blank"
                rel="noopener"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--accent-sky)",
                }}
              >
                Consultar fecha y cupos →
              </a>
            </div>
          </div>
          <p
            style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}
          >
            Fechas, cupos y premios de cada torneo se confirman por WhatsApp.
          </p>
        </div>
      </section>

      {/* MARCADOR DIGITAL & PUNTO DE ORO EN VIVO */}
      <PadelScoreboardLive />

      {/* GENERADOR DE TORNEO AMERICANO EXPRESS */}
      <AmericanoGenerator />

      {/* BUSCADOR INTERACTIVO DE PALAS PRO */}
      <RacketFinderQuiz />

      {/* CANTINA */}
      <CantinaSection />

      {/* TESTIMONIOS Y COMUNIDAD */}
      <TestimonialsSection />

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
              className="btn btn-secondary"
              style={{ gap: 6 }}
            >
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
              Abrir en Google Maps →
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
                className="btn btn-linear-primary"
                style={{ pointerEvents: "auto", height: 38, gap: 6 }}
              >
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
                Abrir en Google Maps
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
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <a
              href="https://maps.app.goo.gl/kR1h9mhdLqGLKatV7"
              target="_blank"
              rel="noopener"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
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
              <span style={{ fontSize: 18, color: "var(--text-secondary)" }}>
                ↗
              </span>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  Atención Directa
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
                <span style={{ fontSize: 13, color: "#34d399" }}>
                  +54 9 299 597-4176
                </span>
              </div>
              <span style={{ fontSize: 18, color: "var(--text-secondary)" }}>
                ↗
              </span>
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
