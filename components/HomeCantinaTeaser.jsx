import Link from "next/link";
import { BentoPhotoCard } from "./PhotoCard";
import { CALCULATOR_ITEMS } from "../data/menu";
import { CLUB_INFO } from "../data/club";

const FEATURED_ITEMS = CALCULATOR_ITEMS.slice(0, 6);

export default function HomeCantinaTeaser() {
  return (
    <section
      id="cantina"
      className="section-bento"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="container">
        <div className="section-header-row">
          <div>
            <span
              className="badge-linear badge-amber"
              style={{ marginBottom: 8 }}
            >
              Gastronomía &amp; Encuentro
            </span>
            <h2 className="section-title">Cantina Propia &amp; 3er Tiempo</h2>
            <p className="section-desc">
              Pizzas caseras a la piedra, tostados, sándwiches abundantes y
              cervezas heladas con vista directa a la pista.
            </p>
          </div>
          <Link href="/menu" className="btn btn-secondary" style={{ gap: 6 }}>
            Ver Menú Completo (60+ productos) →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <BentoPhotoCard
            src="/img/cantina_beer_court.jpg"
            alt="Cerveza helada y vista a la pista en la cantina de Muzzaga"
            caption="Cantina Muzzaga · Tercer Tiempo con Vista a las Canchas"
            badge="Tercer Tiempo"
            badgeClassName="badge-amber"
            title="Cervezas heladas y vista a las dos canchas"
          >
            Disfrutá una Patagonia, Heineken o Corona bien fría comentando los
            mejores puntos del partido con tus amigos.
          </BentoPhotoCard>

          <BentoPhotoCard
            src="/img/bar_coffee_snacks.jpg"
            alt="Buffet y minutas caseras en la cantina de Muzzaga"
            caption="Cantina Muzzaga · Comida Casera y Buffet de Pistas"
            badge="Cocina Propia"
            badgeClassName="badge-emerald"
            title="Pizzas a la piedra y sándwiches de mila"
          >
            Muzzas bien cargadas, tostados en pan de miga y opciones Sin TACC
            listas para cuando termines de jugar.
          </BentoPhotoCard>
        </div>

        {/* 6 PRODUCTOS DESTACADOS CON PRECIO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {FEATURED_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: 14, color: "var(--color-ink)" }}>
                  {item.name}
                </strong>
                {item.tag && (
                  <span
                    className="badge-linear badge-emerald"
                    style={{ fontSize: 10, marginLeft: 6 }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link
            href="/menu"
            className="btn btn-secondary"
            style={{ padding: "10px 24px" }}
          >
            Explorar toda la carta con buscador y filtros →
          </Link>
        </div>
      </div>
    </section>
  );
}
