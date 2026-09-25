"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MENU_ITEMS, MENU_CATEGORIES } from "../../data/menu";
import { CLUB_INFO } from "../../data/club";
import ScrollRow from "../../components/ScrollRow";
import CantinaCart, { QtyStepper } from "../../components/CantinaCart";
import {
  MAX_ORDER_QTY,
  deliveryFromParam,
  orderCount,
  orderLines,
  orderTotal,
  parseStoredCart,
} from "../../lib/cantinaOrder";
import { MapPin, ShoppingCart, Pizza, CupSoda, Beer, Candy, ShoppingBag } from "lucide-react";

// El pedido queda en el navegador: si se recarga la página no se pierde.
const CART_KEY = "muzzaga-pedido";

// Íconos de las pestañas (antes eran emojis dentro del texto de data/menu.js).
const CATEGORY_ICONS = {
  buffet: Pizza,
  "bebidas-sin": CupSoda,
  "bebidas-con": Beer,
  kiosco: Candy,
  accesorios: ShoppingBag,
};

function CategoryIcon({ id }) {
  const Icon = CATEGORY_ICONS[id];
  return Icon ? <Icon size={20} className="icono-marca" aria-hidden="true" /> : null;
}

const LOCATION_NAMES = {
  "cancha-1": "Cancha 1 (cristal)",
  "cancha-2": "Cancha 2 (cristal)",
  "cancha1": "Cancha 1 (cristal)",
  "cancha2": "Cancha 2 (cristal)",
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
  // Con el QR de una cancha o mesa, el pedido ya sale con esa entrega.
  const initialDelivery = activeLocation ? deliveryFromParam(rawLocation) : null;

  const [cart, setCart] = useState({}); // { id: cantidad }
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      setCart(parseStoredCart(localStorage.getItem(CART_KEY), MENU_ITEMS));
    } catch {}
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, cartLoaded]);

  const setQty = (id, qty) =>
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(MAX_ORDER_QTY, qty);
      return next;
    });

  const lines = useMemo(() => orderLines(cart, MENU_ITEMS), [cart]);

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

  const handleGeneralOrder = () => {
    const locationPrefix = activeLocation
      ? `*CONSULTA DESDE ${activeLocation.toUpperCase()}*\n\n`
      : "";
    const msg = `${locationPrefix}¡Hola Muzzaga! Tengo una consulta para la cantina.`;
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
            <MapPin size={20} className="icono-marca" aria-hidden="true" />
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--color-accent-orange-text)" }}>
                Entrega directa activada
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
            Carta de la cantina · Tercer tiempo
          </span>
          <h1 className="section-title">Menú de la cantina</h1>
          <p className="section-desc">
            Pizzas a la piedra, tostados, sándwiches abundantes, cervezas heladas
            y kiosco con vista directa a las canchas. Armá tu pedido con el
            carrito y mandalo por WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGeneralOrder}
          className="btn btn-secondary-whatsapp"
          style={{ gap: 8, height: 42, cursor: "pointer" }}
        >
          Consultas por WhatsApp →
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
        <ScrollRow className="menu-category-tabs" role="group" aria-label="Categorías de la carta">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`booking-court-tab${selectedCat === cat.id ? " active" : ""}`}
              onClick={() => setSelectedCat(cat.id)}
              style={{ whiteSpace: "nowrap" }}
            >
              <CategoryIcon id={cat.id} />
              {cat.label}
            </button>
          ))}
        </ScrollRow>
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
          {filteredItems.map((item) => {
            const qty = cart[item.id] || 0;
            return (
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
                transition: "transform var(--t-hover) var(--ease), opacity var(--t-hover) var(--ease)",
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
                {qty > 0 ? (
                  <QtyStepper name={item.name} qty={qty} onChange={(q) => setQty(item.id, q)} />
                ) : (
                  <button
                    type="button"
                    className="menu-add-btn"
                    onClick={() => setQty(item.id, 1)}
                    aria-label={`Agregar ${item.name} al pedido`}
                    title="Agregar al pedido"
                  >
                    <ShoppingCart size={20} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      <CantinaCart
        lines={lines}
        count={orderCount(lines)}
        total={orderTotal(lines)}
        onQty={setQty}
        onClear={() => setCart({})}
        initialDelivery={initialDelivery}
        open={cartOpen}
        onOpen={() => setCartOpen(true)}
        onClose={() => setCartOpen(false)}
      />

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
          Reservar cancha →
        </Link>
      </div>
    </div>
  );
}
