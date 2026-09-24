"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MENU_ITEMS, MENU_CATEGORIES } from "../../data/menu";
import { CLUB_INFO } from "../../data/club";

const LOCATION_NAMES = {
  "cancha-1": "Cancha 1 (Pista de Cristal)",
  "cancha-2": "Cancha 2 (Pista de Cristal)",
  "cancha1": "Cancha 1 (Pista de Cristal)",
  "cancha2": "Cancha 2 (Pista de Cristal)",
  "mesa-1": "Mesa 1 (Cantina)",
  "mesa-2": "Mesa 2 (Cantina)",
  "mesa-3": "Mesa 3 (Cantina)",
  "mesa-4": "Mesa 4 (Cantina)",
  "mesa-5": "Mesa 5 (Cantina)",
  "mesa-6": "Mesa 6 (Cantina)",
};

export default function MenuClient() {
  const searchParams = useSearchParams();
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");

  const rawLocation =
    searchParams.get("ubicacion") ||
    searchParams.get("cancha") ||
    searchParams.get("mesa");

  const [activeLocation, setActiveLocation] = useState(
    rawLocation ? LOCATION_NAMES[rawLocation.toLowerCase()] || rawLocation : null
  );

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
    const locationPrefix = activeLocation
      ? `*PEDIDO PARA ${activeLocation.toUpperCase()}*\n\n`
      : "";
    const msg = `${locationPrefix}¡Hola Muzzaga! Quiero pedir ${itemName} ($${itemPrice.toLocaleString("es-AR")}) de la cantina.`;
    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleGeneralOrder = () => {
    const locationPrefix = activeLocation
      ? `*PEDIDO PARA ${activeLocation.toUpperCase()}*\n\n`
      : "";
    const msg = `${locationPrefix}¡Hola Muzzaga! Quiero hacer un pedido a la cantina.`;
    window.open(
      `https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* BANNER DE ENTREGA EN CANCHA / MESA SI VIENE POR QR */}
      {activeLocation && (
        <div
          style={{
            background: "linear-gradient(90deg, rgba(232, 114, 42, 0.15) 0%, rgba(232, 114, 42, 0.05) 100%)",
            border: "1px solid var(--color-accent-orange-border, #f2cbb4)",
            borderRadius: "var(--radius-lg, 12px)",
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>📍</span>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--color-accent-orange-text)" }}>
                Entrega Directa Activada
              </div>
              <strong style={{ fontSize: 15, color: "var(--color-ink)" }}>
                {activeLocation}
              </strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveLocation(null)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Quitar ubicación
          </button>
        </div>
      )}

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
        <button
          type="button"
          onClick={handleGeneralOrder}
          className="btn btn-secondary-whatsapp"
          style={{ gap: 8, height: 42, cursor: "pointer" }}
        >
          Pedir por adelantado vía WhatsApp →
        </button>
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
            placeholder="Buscar: pizza, Corona, sin TACC…"
            aria-label="Buscar en la carta"
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
                transition: "all 0.15s var(--ease)",
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
                    width: 44,
                    height: 44,
                    flexShrink: 0,
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
