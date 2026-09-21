"use client";

import { useMemo, useState } from "react";
import { priceForSlot } from "../lib/booking";

const CANCHA_PRICE = priceForSlot().total;

const EXTRAS = [
  { id: "pizza_muzza", name: "Pizza muzza", price: 18000, icon: "🍕" },
  { id: "pizza_napo", name: "Pizza napo", price: 20000, icon: "🍕" },
  { id: "pizza_especial", name: "Pizza especial", price: 22000, icon: "🍕" },
  { id: "sandwich_mila", name: "Sándwich de mila", price: 22000, icon: "🥪" },
  { id: "empanadas", name: "Empanadas", price: 24000, icon: "🥟" },
  { id: "tostados", name: "Tostados", price: 14000, icon: "🥪" },
  { id: "heineken", name: "Heineken 975ml", price: 9000, icon: "🍺" },
  { id: "stella", name: "Stella Artois 975ml", price: 9000, icon: "🍺" },
  { id: "corona", name: "Corona 710ml", price: 9000, icon: "🍺" },
  { id: "patagonia", name: "Patagonia 710ml", price: 9000, icon: "🍺" },
  { id: "fernet", name: "Fernet y coca", price: 10000, icon: "🥃" },
  { id: "coca", name: "Coca-Cola 1.5L", price: 6000, icon: "🥤" },
  { id: "agua", name: "Agua 1.5L", price: 4000, icon: "💧" },
  { id: "cafe_grande", name: "Café grande", price: 4000, icon: "☕" },
  { id: "cafe_chico", name: "Café chico", price: 3000, icon: "☕" },
  { id: "porcion_dulce", name: "Porción dulce", price: 6000, icon: "🍰" },
];

export default function SplitCostCalculator() {
  const [players, setPlayers] = useState(4);
  const [selectedExtras, setSelectedExtras] = useState({
    heineken: 2,
    pizza_muzza: 1,
  });
  const [copied, setCopied] = useState(false);

  const canchaPrice = CANCHA_PRICE;

  const addExtra = (id) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeExtra = (id) => {
    setSelectedExtras((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const extrasTotal = useMemo(() => {
    return Object.entries(selectedExtras).reduce((acc, [id, qty]) => {
      const item = EXTRAS.find((e) => e.id === id);
      return acc + (item ? item.price * qty : 0);
    }, 0);
  }, [selectedExtras]);

  const grandTotal = canchaPrice + extrasTotal;
  const perPerson = Math.round(grandTotal / (players || 1));

  const copyToWhatsapp = () => {
    let msg = `🎾 *DESGLOSE PARTIDO MUZZAGA PÁDEL*\n`;
    msg += `🏟️ *Cancha (90 min):* $${canchaPrice.toLocaleString("es-AR")}\n`;
    msg += `   ($${(canchaPrice / 4).toLocaleString("es-AR")} por jugador si son cuatro)\n`;
    
    const extraEntries = Object.entries(selectedExtras);
    if (extraEntries.length > 0) {
      msg += `\n🍕 *Cantina & Extras:*\n`;
      extraEntries.forEach(([id, qty]) => {
        const item = EXTRAS.find((e) => e.id === id);
        if (item) {
          msg += `• ${qty}x ${item.name}: $${(item.price * qty).toLocaleString("es-AR")}\n`;
        }
      });
    }

    msg += `\n💰 *Total General:* $${grandTotal.toLocaleString("es-AR")}\n`;
    msg += `👥 *Total por jugador (${players} personas):* 👉 *$${perPerson.toLocaleString("es-AR")}*\n\n`;
    msg += `📱 *Alias de pago:* Consultar alias en el mostrador`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="split-cost" className="section-turnos">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-emerald" style={{ marginBottom: 8 }}>
              Herramienta para Grupos
            </span>
            <h2 className="section-title">Calculadora de Partido &amp; 3er Tiempo</h2>
            <p className="section-desc">
              Dividí en segundos la cancha y lo que van a comer o tomar en la cantina. Copiá el desglose y pasalo al grupo.
            </p>
          </div>
        </div>

        <div className="split-calculator-grid">
          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
          <div className="split-config-card">
            <div className="split-section-header">
              <span className="split-step-badge">1</span>
              <div>
                <h3 className="split-step-title">Turno de Cancha (90 min)</h3>
                <p className="split-step-desc">Tarifa fija para todos los días y horarios</p>
              </div>
            </div>

            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: "var(--color-canvas-soft)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: 14 }}>
                  🏟️ Cancha Oficial de Cristal
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                  Turno de 90 minutos
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-ink)" }}>
                  ${canchaPrice.toLocaleString("es-AR")}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-link)", fontWeight: 600 }}>
                  $15.000 c/u (cuarteto)
                </div>
              </div>
            </div>

            <div className="split-section-header">
              <span className="split-step-badge">2</span>
              <div>
                <h3 className="split-step-title">Jugadores a dividir</h3>
                <p className="split-step-desc">¿Entre cuántos dividen los gastos?</p>
              </div>
            </div>

            <div className="players-selector-row">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`player-count-btn${players === num ? " active" : ""}`}
                  onClick={() => setPlayers(num)}
                >
                  {num} {num === 4 ? "🎾 (Estándar)" : "jugadores"}
                </button>
              ))}
            </div>

            <div className="split-section-header" style={{ marginTop: 24 }}>
              <span className="split-step-badge">3</span>
              <div>
                <h3 className="split-step-title">Sumar Cantina &amp; Extras</h3>
                <p className="split-step-desc">Pizzas, birras, bebidas y minutas para el partido.</p>
              </div>
            </div>

            <div className="extras-selector-list">
              {EXTRAS.map((extra) => {
                const qty = selectedExtras[extra.id] || 0;
                return (
                  <div key={extra.id} className="extra-item-row">
                    <div className="extra-info">
                      <span className="extra-icon">{extra.icon}</span>
                      <div>
                        <strong className="extra-name">{extra.name}</strong>
                        <span className="extra-price">${extra.price.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                    <div className="extra-counter-controls">
                      {qty > 0 && (
                        <button
                          type="button"
                          className="counter-btn minus"
                          onClick={() => removeExtra(extra.id)}
                          aria-label="Restar uno"
                        >
                          −
                        </button>
                      )}
                      {qty > 0 && <span className="counter-qty">{qty}</span>}
                      <button
                        type="button"
                        className="counter-btn plus"
                        onClick={() => addExtra(extra.id)}
                        aria-label="Agregar uno"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: TICKET FINTECH & COPIAR */}
          <div className="split-summary-card">
            <div className="split-ticket-top">
              <span className="split-ticket-badge">Resumen del Partido</span>
              <div className="split-amount-big">
                ${perPerson.toLocaleString("es-AR")}
                <span className="split-amount-sub">por jugador ({players} pers.)</span>
              </div>
            </div>

            <div className="split-ticket-breakdown">
              <div className="ticket-row">
                <div>
                  <span>Cancha Oficial (90 min)</span>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    ${(canchaPrice / 4).toLocaleString("es-AR")} por jugador si son cuatro
                  </div>
                </div>
                <strong>${canchaPrice.toLocaleString("es-AR")}</strong>
              </div>

              {Object.entries(selectedExtras).map(([id, qty]) => {
                const item = EXTRAS.find((e) => e.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="ticket-row extra">
                    <span>
                      {qty}x {item.name}
                    </span>
                    <strong>${(item.price * qty).toLocaleString("es-AR")}</strong>
                  </div>
                );
              })}

              <div className="ticket-divider" />

              <div className="ticket-row total">
                <span>Total General</span>
                <strong>${grandTotal.toLocaleString("es-AR")}</strong>
              </div>
            </div>

            <button
              type="button"
              className={`btn ${copied ? "btn-whatsapp" : "btn-linear-primary"}`}
              style={{ width: "100%", justifyContent: "center", height: 46, fontSize: 15 }}
              onClick={copyToWhatsapp}
            >
              {copied ? "✓ ¡Desglose copiado al portapapeles!" : "📋 Copiar desglose para WhatsApp"}
            </button>

            <div className="split-alias-notice">
              <span>💳 Alias para transferencias:</span>
              <code>Consultar alias en el mostrador</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
