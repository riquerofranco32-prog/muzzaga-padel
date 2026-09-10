"use client";

import { useState } from "react";
import { BentoPhotoCard } from "./PhotoCard";

const MENU_ITEMS = [
  {
    category: "pizzas",
    name: "Pizza Muzzarella",
    desc: "Masa a la piedra casera con abundante muzzarella y orégano",
    price: "$18.000",
    tag: "Clásico",
  },
  {
    category: "pizzas",
    name: "Pizza Napolitana",
    desc: "Rodajas de tomate fresco, ajo picado y aceite de oliva",
    price: "$20.000",
    tag: "Recomendada",
  },
  {
    category: "pizzas",
    name: "Pizza Especial Jamón y Morrones",
    desc: "Muzzarella, jamón cocido seleccionado y morrones asados",
    price: "$22.000",
  },
  {
    category: "pizzas",
    name: "Pizza Fugazzeta Rellena",
    desc: "Cebolla caramelizada crocante con doble queso",
    price: "$21.000",
  },
  {
    category: "minutas",
    name: "Sándwich de Milanesa Completo",
    desc: "Lechuga, tomate, jamón, queso y huevo frito en pan casero",
    price: "$22.000",
    tag: "Abundante",
  },
  {
    category: "minutas",
    name: "Empanadas de Carne (Docena)",
    desc: "Carne cortada a cuchillo, masa casera dorada al horno",
    price: "$24.000",
  },
  {
    category: "minutas",
    name: "Tostado de Jamón y Queso",
    desc: "Pan de miga crocante y mantecoso",
    price: "$9.500",
  },
  {
    category: "bebidas",
    name: "Pinta Cerveza Tirada Artesanal",
    desc: "IPA, Golden o Scottish bien helada al paso",
    price: "$5.500",
    tag: "Tirada",
  },
  {
    category: "bebidas",
    name: "Heineken 975 ml",
    desc: "Botella helada para compartir en el tercer tiempo",
    price: "$9.000",
  },
  {
    category: "bebidas",
    name: "Fernet Branca con Coca-Cola",
    desc: "Vaso trago largo con hielo frappe",
    price: "$8.500",
  },
  {
    category: "bebidas",
    name: "Gatorade / Powerade 500 ml",
    desc: "Hidratación isotónica para recuperar durante el partido",
    price: "$4.000",
  },
  {
    category: "bebidas",
    name: "Agua Mineral / Saborizada 500 ml",
    desc: "Con o sin gas bien fría",
    price: "$2.500",
  },
];

const CATEGORIES = [
  { id: "all", label: "Todo el Menú" },
  { id: "pizzas", label: "🍕 Pizzas a la Piedra" },
  { id: "minutas", label: "🥪 Minutas & Sándwiches" },
  { id: "bebidas", label: "🍺 Cervezas & Bebidas" },
];

export default function CantinaSection() {
  const [selectedCat, setSelectedCat] = useState("all");

  const filteredItems =
    selectedCat === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selectedCat);

  return (
    <section id="cantina" className="section-bento" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Gastronomía &amp; Encuentro
            </span>
            <h2 className="section-title">Cantina Propia &amp; 3er Tiempo</h2>
            <p className="section-desc">
              Pizzas caseras a la piedra, sándwiches abundantes y cervezas heladas con vista directa a la pista.
            </p>
          </div>
          <a
            href="https://wa.me/5492995974176?text=Hola%20Muzzaga!%20Quiero%20hacer%20un%20pedido%20a%20la%20cantina%20para%20despues%20del%20partido."
            target="_blank"
            rel="noopener"
            className="btn btn-secondary"
          >
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
            alt="Cantina de Muzzaga con cerveza tirada"
            caption="Barra y canillas de cerveza artesanal con vista a la cancha"
            title="Cerveza Tirada y Vista a Canchas"
          >
            Terminá de jugar y pedite una pinta helada mirando el siguiente partido.
          </BentoPhotoCard>
          <BentoPhotoCard
            src="/img/bar_coffee_snacks.jpg"
            alt="Empanadas y pantalla grande en la cantina de Muzzaga"
            caption="Empanadas y pantalla grande en la cantina"
            title="Empanadas & Pantalla Grande"
          >
            Mirá los partidos y eventos deportivos en la pantalla de la cantina con algo rico para picar.
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

        <div className="menu-items-grid">
          {filteredItems.map((item) => (
            <div className="menu-item-card" key={item.name}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <strong style={{ color: "var(--text-primary)", fontSize: 15 }}>
                    {item.name}
                  </strong>
                  {item.tag && (
                    <span className="badge-linear badge-emerald" style={{ fontSize: 10, padding: "2px 6px" }}>
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
                  fontFamily: "var(--font-mono)",
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
      </div>
    </section>
  );
}
