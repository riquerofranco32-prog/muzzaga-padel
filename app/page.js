import Header from "../components/Header";
import HeroMarquee from "../components/HeroMarquee";
import BookingCalendar from "../components/BookingCalendar";
import RatingCalculator from "../components/RatingCalculator";
import { BentoPhotoCard } from "../components/PhotoCard";
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
          <div className="tagline-pill">
            <span className="pulse-dot" style={{ color: "#10b981" }} />
            Catriel, Río Negro · 2 Canchas de Cristal Profesionales
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

      {/* CANCHAS ABIERTAS */}
      <section id="canchas-abiertas" className="section-community">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span
                className="badge-linear badge-amber"
                style={{ marginBottom: 8 }}
              >
                Ejemplo · Matchmaking &amp; Comunidad
              </span>
              <h2 className="section-title">Canchas Abiertas en Catriel</h2>
              <p className="section-desc">
                Así funciona: sumate a partidos que están buscando jugador o
                publicá tu propia convocatoria si te falta gente. Los partidos
                reales del día se coordinan por WhatsApp.
              </p>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                "¡Hola Muzzaga! 👋 Quiero armar una Cancha Abierta para jugar hoy/mañana. ¿Me ayudan a publicar la convocatoria en el grupo del club?",
              )}`}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
            >
              + Publicar Partido Abierto
            </a>
          </div>

          <div className="open-cards-grid">
            <div className="open-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="badge-linear badge-amber">
                    Ejemplo · 6ta Categoría · Nivel 3.0 - 3.5
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Día y horario a coordinar
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "12px 0 4px",
                  }}
                >
                  Cancha 1 · Cristal
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  Partido parejo para subir nivel y ranking. Consultá quiénes
                  juegan hoy por WhatsApp.
                </p>

                <div className="player-slots-layout">
                  <div className="player-slot-item taken">Jugador 1</div>
                  <div className="player-slot-item taken">Jugador 2</div>
                  <div className="player-slot-item taken">Jugador 3</div>
                  <div className="player-slot-item free">+1 ¡Libre!</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: 14,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Tu plaza:
                  </span>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                    }}
                  >
                    $15.000
                  </strong>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    "Hola Muzzaga! Quiero sumarme a una cancha abierta de 6ta. ¿Hay algún partido con lugar?",
                  )}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-whatsapp"
                  style={{ height: 36, padding: "6px 14px" }}
                >
                  Sumarme al partido →
                </a>
              </div>
            </div>

            <div className="open-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="badge-linear badge-emerald">
                    Ejemplo · 7ma / Inicial · Nivel 1.5 - 2.5
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    Día y horario a coordinar
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "12px 0 4px",
                  }}
                >
                  Cancha 2
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                  Partido distendido con tercer tiempo en la cantina. Consultá
                  quiénes juegan hoy por WhatsApp.
                </p>

                <div className="player-slots-layout">
                  <div className="player-slot-item taken">Jugador 1</div>
                  <div className="player-slot-item taken">Jugador 2</div>
                  <div className="player-slot-item free">+1 ¡Libre!</div>
                  <div className="player-slot-item free">+2 ¡Libre!</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: 14,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Tu plaza:
                  </span>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                    }}
                  >
                    $15.000
                  </strong>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                    "Hola Muzzaga! Quiero sumarme a una cancha abierta de 7ma. ¿Hay algún partido con lugar?",
                  )}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-whatsapp"
                  style={{ height: 36, padding: "6px 14px" }}
                >
                  Sumarme al partido →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* CANTINA */}
      <section
        id="cantina"
        className="section-bento"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Cantina Propia &amp; 3er Tiempo</h2>
              <p className="section-desc">
                Pizzas caseras a la piedra, sándwiches abundantes y cervezas
                heladas con vista directa a la pista.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <BentoPhotoCard
              src="/img/cantina_beer_court.jpg"
              alt="Cantina de Muzzaga con cerveza tirada"
              caption="Barra y canillas de cerveza artesanal con vista a la cancha"
              title="Cerveza Tirada y Vista a Canchas"
            >
              Terminá de jugar y pedite una pinta helada mirando el siguiente
              partido.
            </BentoPhotoCard>
            <BentoPhotoCard
              src="/img/bar_coffee_snacks.jpg"
              alt="Empanadas y pantalla grande en la cantina de Muzzaga"
              caption="Empanadas y pantalla grande en la cantina"
              title="Empanadas & Pantalla Grande"
            >
              Mirá los partidos en la pantalla de la cantina con algo rico para
              picar.
            </BentoPhotoCard>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {[
              {
                name: "Pizza Muzzarella",
                desc: "A la piedra casera",
                price: "$18.000",
              },
              {
                name: "Pizza Napolitana",
                desc: "Tomate natural, ajo y oliva",
                price: "$20.000",
              },
              {
                name: "Sándwich de Mila",
                desc: "Completo abundante",
                price: "$22.000",
              },
              {
                name: "Heineken 975 ml",
                desc: "Botella bien fría",
                price: "$9.000",
              },
            ].map((item) => (
              <div className="menu-item-card" key={item.name}>
                <div>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 15,
                      display: "block",
                    }}
                  >
                    {item.name}
                  </strong>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    {item.desc}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: 16,
                  }}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <Footer />
      <BottomNav />
      <ScrollReveal />
    </>
  );
}
