"use client";

import { useState } from "react";
import { BentoPhotoCard } from "./PhotoCard";

const MENU_ITEMS = [
  {
    category: "compartir",
    name: "Pizza muzza",
    desc: "Masa a la piedra casera con abundante muzzarella y orégano",
    price: "$18.000",
  },
  {
    category: "compartir",
    name: "Pizza napo",
    desc: "Rodajas de tomate fresco, ajo y muzzarella",
    price: "$20.000",
  },
  {
    category: "compartir",
    name: "Pizza especial (jamón, huevo y muzzarella)",
    desc: "Muzzarella, jamón cocido seleccionado y huevo",
    price: "$22.000",
  },
  {
    category: "compartir",
    name: "Tostados",
    desc: "Tostado clásico de jamón y queso en pan de miga crocante",
    price: "$14.000",
  },
  {
    category: "compartir",
    name: "Empanadas",
    desc: "Empanadas caseras de carne al horno",
    price: "$24.000",
  },
  {
    category: "compartir",
    name: "Sándwich de mila",
    desc: "Sándwich de milanesa casero con lechuga y tomate",
    price: "$22.000",
  },
  {
    category: "bebidas",
    name: "Agua 1.5L",
    desc: "Agua mineral bien fría",
    price: "$4.000",
  },
  {
    category: "bebidas",
    name: "Coca-Cola 1.5L",
    desc: "Botella grande de 1.5L helada",
    price: "$6.000",
  },
  {
    category: "bebidas",
    name: "Heineken 975ml",
    desc: "Botella helada para compartir en el tercer tiempo",
    price: "$9.000",
  },
  {
    category: "bebidas",
    name: "Stella Artois 975ml",
    desc: "Botella helada para compartir",
    price: "$9.000",
  },
  {
    category: "bebidas",
    name: "Corona 710ml",
    desc: "Botella de 710ml bien fría",
    price: "$9.000",
  },
  {
    category: "bebidas",
    name: "Patagonia 710ml",
    desc: "Variedades Patagonia botella de 710ml",
    price: "$9.000",
  },
  {
    category: "bebidas",
    name: "Fernet y coca",
    desc: "Vaso de Fernet Branca con Coca-Cola y hielo",
    price: "$10.000",
  },
  {
    category: "cafeteria",
    name: "Café grande",
    desc: "Café en taza grande",
    price: "$4.000",
  },
  {
    category: "cafeteria",
    name: "Café chico",
    desc: "Pocillo de café express",
    price: "$3.000",
  },
  {
    category: "cafeteria",
    name: "Porción dulce",
    desc: "Porción dulce artesanal para acompañar el café",
    price: "$6.000",
  },
];

const CATEGORIES = [
  { id: "all", label: "Todo el Menú" },
  { id: "compartir", label: "Para Compartir" },
  { id: "bebidas", label: "Bebidas" },
  { id: "cafeteria", label: "Cafetería" },
];

export default function CantinaSection() {
  const [selectedCat, setSelectedCat] = useState("all");

  const filteredItems =
    selectedCat === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selectedCat);

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
              Pizzas caseras a la piedra, sándwiches abundantes y cervezas
              heladas con vista directa a la pista.
            </p>
          </div>
          <a
            href="https://wa.me/5492995974176?text=Hola%20Muzzaga!%20Quiero%20hacer%20un%20pedido%20a%20la%20cantina%20para%20despues%20del%20partido."
            target="_blank"
            rel="noopener"
            className="btn btn-secondary-whatsapp"
            style={{ gap: 8 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z" />
            </svg>
            Pedir por adelantado para tu partido →
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <BentoPhotoCard
            src="/img/cantina_beer_court.jpg"
            alt="Cantina de Muzzaga con vista a la cancha"
            caption="Cantina con vista a las canchas"
            title="Cantina y Vista a Canchas"
          >
            Terminá de jugar y disfrutá del tercer tiempo con vista a los
            partidos.
          </BentoPhotoCard>
          <BentoPhotoCard
            src="/img/bar_coffee_snacks.jpg"
            alt="Empanadas, pizzas y cafetería en la cantina de Muzzaga"
            caption="Empanadas caseras y cafetería en la cantina"
            title="Empanadas &amp; Pantalla Grande"
          >
            Mirá los partidos y eventos deportivos en la pantalla de la cantina
            con algo rico para picar.
          </BentoPhotoCard>
        </div>

        <div className="menu-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`menu-filter-pill${selectedCat === cat.id ? " active" : ""}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <p className="mobile-swipe-hint">← Deslizá para ver más opciones →</p>
        <div className="menu-items-grid">
          {filteredItems.map((item) => (
            <div className="menu-item-card" key={item.name}>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <strong
                    style={{ color: "var(--text-primary)", fontSize: 15 }}
                  >
                    {item.name}
                  </strong>
                  {item.tag && (
                    <span
                      className="badge-linear badge-emerald"
                      style={{ fontSize: 10, padding: "2px 6px" }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {item.desc}
                </span>
              </div>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontSize: 16,
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {item.price}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          Consultanos por opciones sin TACC y veganas
        </p>
      </div>
    </section>
  );
}
