"use client";

import { useEffect, useState } from "react";
import { formatARS } from "../../../lib/format";
import {
  adminAddCantinaSale,
  adminDeleteCantinaSale,
  adminGetCantinaSales,
  adminSetTestFlag,
} from "../actions";
import { MENU_CATEGORIES, MENU_ITEMS } from "../../../data/menu";
import { todayInClub } from "../../../lib/booking";
import { computeDailyCash } from "../../../lib/metrics";
import { IconTrash, PAYMENT_METHODS } from "../adminHelpers";

export default function CantinaView({ onExpiredSession }) {
  const [date, setDate] = useState(todayInClub);
  const [selectedCat, setSelectedCat] = useState("all");
  const [cart, setCart] = useState([]); // [{name, price, qty}]
  const [method, setMethod] = useState("efectivo");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSales();
  }, [date]);

  async function loadSales() {
    setLoading(true);
    const res = await adminGetCantinaSales(date);
    setLoading(false);
    if (res.ok) {
      setSales(res.sales || []);
    } else if (onExpiredSession) {
      onExpiredSession(res);
    }
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((it) => it.name === item.name);
      if (existing) {
        return prev.map((it) =>
          it.name === item.name ? { ...it, qty: it.qty + 1 } : it,
        );
      }
      return [...prev, { name: item.name, price: item.price, qty: 1 }];
    });
  }

  function updateQty(name, delta) {
    setCart((prev) =>
      prev
        .map((it) => (it.name === name ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0),
    );
  }

  const cartTotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);

  async function handleSubmitSale() {
    if (cart.length === 0) return;
    setSubmitting(true);
    const res = await adminAddCantinaSale({ date, items: cart, method });
    setSubmitting(false);
    if (res.ok) {
      setCart([]);
      loadSales();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo registrar la venta.");
    }
  }

  async function handleDeleteSale(saleId) {
    if (!confirm("¿Eliminar esta venta?")) return;
    const res = await adminDeleteCantinaSale(saleId);
    if (res.ok) {
      loadSales();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo eliminar la venta.");
    }
  }

  const filteredItems =
    selectedCat === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selectedCat);

  // Mismo cálculo que Caja: excluye las ventas marcadas como prueba.
  const dayTotal = computeDailyCash({ sales }).cobradoCantina;
  const realSalesCount = sales.filter((s) => !s.isTest).length;

  async function handleToggleTest(sale) {
    const res = await adminSetTestFlag("cantinaSales", sale.id, !sale.isTest);
    if (res.ok) {
      loadSales();
    } else if (!onExpiredSession?.(res)) {
      alert(res.error || "No se pudo actualizar la venta.");
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2 className="admin-section-title" style={{ marginBottom: 0 }}>
          Cantina
        </h2>
        <input
          type="date"
          className="admin-input-field"
          style={{ width: 170 }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="admin-cantina-layout">
        <div>
          <div className="menu-filter-bar" style={{ marginBottom: 14 }}>
            {MENU_CATEGORIES.map((cat) => (
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

          <div className="admin-cantina-menu-grid">
            {filteredItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className="admin-cantina-item-btn"
                onClick={() => addToCart(item)}
              >
                <span>{item.name}</span>
                <span className="admin-cantina-item-price">
                  {formatARS(item.price)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-cantina-cart">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
            Venta Actual
          </h3>
          {cart.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Tocá un producto para agregarlo.
            </p>
          ) : (
            <div style={{ marginBottom: 12 }}>
              {cart.map((it) => (
                <div key={it.name} className="admin-cantina-cart-line">
                  <span>{it.name}</span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() => updateQty(it.name, -1)}
                    >
                      -
                    </button>
                    <strong style={{ fontSize: 12 }}>{it.qty}</strong>
                    <button
                      type="button"
                      className="admin-mini-btn"
                      onClick={() => updateQty(it.name, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 12,
            }}
          >
            <span>Total</span>
            <span>{formatARS(cartTotal)}</span>
          </div>

          <label className="admin-field-label">Método de pago</label>
          <select
            className="admin-modal-select"
            style={{ width: "100%", marginBottom: 12 }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-linear-primary"
            style={{ width: "100%", height: 42, justifyContent: "center" }}
            disabled={cart.length === 0 || submitting}
            onClick={handleSubmitSale}
          >
            {submitting ? "Guardando..." : "Registrar Venta"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 className="admin-section-title">
          Ventas del Día ({realSalesCount}) · {formatARS(dayTotal)}
        </h2>
        <div
          className={`admin-cantina-sales-list ${loading ? "admin-content-loading" : ""}`}
        >
          {sales.length > 0 ? (
            sales.map((s) => (
              <div key={s.id} className="admin-cantina-sale-row">
                <span>
                  {s.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>
                    {formatARS(s.total)}
                  </strong>
                  <span
                    className="badge-linear badge-emerald"
                    style={{ fontSize: 10 }}
                  >
                    {PAYMENT_METHODS.find((m) => m.value === s.method)?.label ||
                      s.method}
                  </span>
                  <button
                    type="button"
                    className={`badge-linear ${s.isTest ? "badge-amber" : ""}`}
                    style={{ fontSize: 10, cursor: "pointer" }}
                    onClick={() => handleToggleTest(s)}
                    title={
                      s.isTest
                        ? "Dato de prueba: no suma. Tocá para contarla como venta real."
                        : "Marcar como dato de prueba (deja de sumar en caja y reportes)"
                    }
                  >
                    {s.isTest ? "PRUEBA" : "¿Prueba?"}
                  </button>
                  <button
                    type="button"
                    className="admin-table-action-btn delete"
                    onClick={() => handleDeleteSale(s.id)}
                    title="Eliminar venta"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Todavía no hay ventas registradas para este día.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
