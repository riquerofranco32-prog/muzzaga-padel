import Link from "next/link";
import { BentoPhotoCard } from "./PhotoCard";
import { CALCULATOR_ITEMS } from "../data/menu";
import { CLUB_INFO } from "../data/club";
import Mascota from "./Mascota";

const FEATURED_ITEMS = CALCULATOR_ITEMS.slice(0, 6);

export default function HomeCantinaTeaser() {
  return (
    <section
      id="cantina"
      className="section-bento"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="container">
        <div className="section-header-row" style={{ alignItems: "center" }}>
          <div>
            <span
              className="badge-linear badge-amber"
              style={{ marginBottom: 6 }}
            >
              Gastronomía &amp; Encuentro
            </span>
            <h2 className="section-title">Cantina Propia &amp; 3er Tiempo</h2>
            <p className="section-desc">
              Pizzas artesanales al horno, empanadas, cervezas frías y el mejor
              ambiente para seguir jugando afuera de la pista.
            </p>
          </div>
          <div className="mascot-section-badge">
            <Mascota
              pose="pizza-cerveza"
              alt="Muzzaguito con pizza y cerveza en la cantina"
              className="mascot-section-img"
            />
          </div>
        </div>
        <div className="cantina-photos">
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

        {/* PRODUCTOS DESTACADOS CON PRECIO — pizarra de menú */}
        <div className="menu-board">
          <div className="menu-board-head">
            <span className="menu-board-title">Lo más pedido</span>
            <span className="menu-board-note">Precios actualizados</span>
          </div>
          <ul className="menu-board-list">
            {FEATURED_ITEMS.map((item) => (
              <li key={item.id} className="menu-board-item">
                <span className="menu-board-name">
                  {item.name}
                  {item.tag && <span className="menu-board-tag">{item.tag}</span>}
                </span>
                <span className="menu-board-dots" aria-hidden="true" />
                <span className="menu-board-price">${item.price.toLocaleString("es-AR")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-more">
          <Link href="/menu" className="section-more-link">
            Ver la carta completa <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
