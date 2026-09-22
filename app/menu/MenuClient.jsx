"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MENU_ITEMS, MENU_CATEGORIES } from "../../data/menu";
import { CLUB_INFO } from "../../data/club";

export default function MenuClient() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCat = selectedCat === "all" || item.category === selectedCat;
      const matchSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.tag && item.tag.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCat, search]);

  const handleOrderWhatsapp = (itemName, itemPrice) => {
    const msg = `¡Hola Muzzaga! Quiero pedir ${itemName} ($${itemPrice.toLocaleString("es-AR")}) de la cantina para cuando termine mi partido.`;
    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* HEADER DE LA CARTA */}
      <div className="section-header-row" style={{ marginBottom: 24 }}>
        <div>
          <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
            Carta Oficial · Cantina &amp; 3er Tiempo
          </span>
          <h1 className="section-title">Menú de la Cantina</h1>
          <p className="section-desc">
            Pizzas a la piedra, tostados, sándwiches abundantes, cervezas heladas
            y kiosco con vista directa a las canchas.
          </p>
        </div>
        <a
          href={`https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent("¡Hola Muzzaga! Quiero hacer un pedido a la cantina para después del partido.")}`}
          target="_blank"
          rel="noopener"
          className="btn btn-secondary-whatsapp"
          style={{ gap: 8, height: 42 }}
        >
          Pedir por adelantado vía WhatsApp →
        </a>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div style={{ maxWidth: 440 }}>
          <input
            type="search"
            placeholder="Buscar por producto (ej. Pizza, Corona, Sin TACC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "var(--color-surface-card)",
              border: "1px solid var(--color-hairline-strong)",
              borderRadius: "var(--radius-pill)",
              color: "var(--color-ink)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* CHIPS DE CATEGORÍA */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`booking-court-tab${selectedCat === cat.id ? " active" : ""}`}
              onClick={() => setSelectedCat(cat.id)}
              style={{ whiteSpace: "nowrap" }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      {filteredItems.length === 0 ? (
        <div
          className="booking-empty"
          style={{ padding: "40px 20px", textAlign: "center" }}
        >
          No encontramos productos que coincidan con tu búsqueda. Probá con otro término o categoría.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: 12,
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-lg)",
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                transition: "all 0.15s ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: 15, color: "var(--color-ink)" }}>
                    {item.name}
                  </strong>
                  {item.tag && (
                    <span
                      className={`badge-linear ${
                        item.tag.includes("Sin TACC")
                          ? "badge-emerald"
                          : item.tag.includes("Vegana")
                          ? "badge-indigo"
                          : "badge-amber"
                      }`}
                      style={{ fontSize: 10.5, padding: "2px 8px" }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "right" }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                  }}
                >
                  ${item.price.toLocaleString("es-AR")}
                </span>
                <button
                  type="button"
                  onClick={() => handleOrderWhatsapp(item.name, item.price)}
                  title="Pedir por WhatsApp"
                  style={{
                    background: "rgba(37, 211, 102, 0.12)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#25D366",
                  }}
                >
                  🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER CALL TO ACTION */}
      <div
        style={{
          marginTop: 48,
          padding: "28px 24px",
          background: "var(--color-surface-card)",
          border: "1px solid var(--color-hairline-strong)",
          borderRadius: "var(--radius-xl)",
          textAlign: "center",
          maxWidth: 640,
          margin: "48px auto 0",
        }}
      >
        <h3 style={{ fontSize: 18, color: "var(--color-ink)", marginBottom: 8 }}>
          ¿Venís a jugar?
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 18 }}>
          Reservá tu turno de 90 minutos y asegurate el mejor tercer tiempo en Catriel.
        </p>
        <Link href="/#turnos" className="btn btn-linear-primary" style={{ padding: "10px 24px" }}>
          Reservar Cancha →
        </Link>
      </div>
    </div>
  );
}
