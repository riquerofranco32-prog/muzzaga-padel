"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Portal from "./Portal";
import Mascota from "./Mascota";
import useDialogFocus from "../lib/useDialogFocus";
import { CLUB_INFO } from "../data/club";
import { formatARS, plural } from "../lib/format";
import { trackEvent } from "../lib/analytics";
import {
  DEFAULT_DELIVERY,
  DELIVERY_OPTIONS,
  MAX_ORDER_QTY,
  buildOrderWhatsAppUrl,
  makeOrderCode,
} from "../lib/cantinaOrder";

const NAME_KEY = "muzzaga-pedido-nombre";
const NOT_SAVED = "No pudimos anotar el pedido en el sistema del club.";

/** − cantidad + ; en 1, el "−" es un tacho y saca el producto. */
export function QtyStepper({ name, qty, onChange }) {
  return (
    <span className="qty-stepper" role="group" aria-label={`Cantidad de ${name}`}>
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        aria-label={qty === 1 ? `Sacar ${name} del pedido` : `Uno menos de ${name}`}
      >
        {qty === 1 ? <Trash2 size={18} aria-hidden="true" /> : <Minus size={18} aria-hidden="true" />}
      </button>
      <output className="qty-stepper-value" aria-live="polite">
        {qty}
      </output>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= MAX_ORDER_QTY}
        aria-label={`Uno más de ${name}`}
      >
        <Plus size={18} aria-hidden="true" />
      </button>
    </span>
  );
}

/**
 * Barra "Ver pedido" + panel del pedido de la cantina.
 *
 * Enviar abre WhatsApp con el pedido armado y, en el mismo toque, lo manda
 * al panel del club (POST /api/cantina-orders con keepalive). Si el panel no
 * lo pudo anotar, el WhatsApp sale igual y se avisa.
 */
export default function CantinaCart({ lines, count, total, onQty, onClear, initialDelivery, open, onOpen, onClose }) {
  const [name, setName] = useState("");
  const [deliverTo, setDeliverTo] = useState(initialDelivery || DEFAULT_DELIVERY);
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [sent, setSent] = useState(null); // { code, url, items, total, status, error }
  const nameRef = useRef(null);

  const close = () => {
    setSent(null);
    onClose();
  };
  const dialogRef = useDialogFocus(open, close);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {}
  }, []);

  useEffect(() => {
    setDeliverTo(initialDelivery || DEFAULT_DELIVERY);
  }, [initialDelivery]);

  // Con la barra a la vista, el final de la página sube para que no tape el
  // footer.
  const barVisible = count > 0 && !open;
  useEffect(() => {
    document.body.classList.toggle("has-cart-bar", barVisible);
    return () => document.body.classList.remove("has-cart-bar");
  }, [barVisible]);

  const deliveryOptions = DELIVERY_OPTIONS.some((o) => o.label === deliverTo)
    ? DELIVERY_OPTIONS
    : [...DELIVERY_OPTIONS, { id: "qr", label: deliverTo }];

  function send() {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setNameError("Poné tu nombre para que sepamos de quién es el pedido.");
      nameRef.current?.focus();
      return;
    }
    const order = {
      code: makeOrderCode(),
      items: lines,
      total,
      name: cleanName,
      deliverTo,
      notes: notes.trim(),
    };
    const url = buildOrderWhatsAppUrl(CLUB_INFO.phoneRaw, order);

    // Primero sale el pedido al panel y después se abre WhatsApp, los dos en
    // este mismo toque (ver app/api/cantina-orders/route.js).
    const request = fetch("/api/cantina-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: order.code,
        items: lines.map(({ id, qty }) => ({ id, qty })),
        name: order.name,
        deliverTo,
        notes: order.notes,
      }),
      keepalive: true,
    });
    window.open(url, "_blank", "noopener");
    trackEvent("cantina_pedido", { productos: count, total });

    try {
      localStorage.setItem(NAME_KEY, cleanName);
    } catch {}
    setSent({ code: order.code, url, items: lines, total, status: "sending" });
    setNotes("");
    onClear();

    const settle = (status, error) =>
      setSent((s) => (s && s.code === order.code ? { ...s, status, error } : s));
    request
      .then((res) => res.json().catch(() => ({ ok: false })))
      .then((res) => settle(res.ok ? "ok" : "error", res.error))
      .catch(() => settle("error"));
  }

  return (
    <>
      {barVisible && (
        <button type="button" className="menu-cart-bar" onClick={onOpen}>
          <ShoppingCart size={20} aria-hidden="true" />
          <span className="menu-cart-bar-label">Ver pedido</span>
          <span className="menu-cart-bar-count">{plural(count, "producto", "productos")}</span>
          <strong className="menu-cart-bar-total">{formatARS(total)}</strong>
        </button>
      )}

      {open && (
        <Portal>
          <div className="menu-cart-backdrop" onClick={close}>
            <div
              className="menu-cart-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-cart-title"
              ref={dialogRef}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-cart-head">
                <h2 id="menu-cart-title">{sent ? "¡Pedido enviado!" : "Tu pedido"}</h2>
                <button type="button" className="menu-cart-close" onClick={close} aria-label="Cerrar">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {sent ? (
                <>
                  <div className="menu-cart-body menu-cart-sent">
                    <Mascota pose="pizza-cerveza" size="s" className="pass-festejo" />
                    <p className="menu-cart-sent-code">
                      Pedido <strong>#{sent.code}</strong> · {formatARS(sent.total)}
                    </p>
                    <p className="menu-cart-sent-text" role="status">
                      {sent.status === "sending"
                        ? "Anotando el pedido en la cantina…"
                        : sent.status === "ok"
                          ? "Tocá enviar en WhatsApp y listo: la cantina ya lo tiene en su panel."
                          : `${sent.error || NOT_SAVED} El mensaje de WhatsApp sale igual: tocá enviar ahí.`}
                    </p>
                    <ul className="menu-cart-sent-lines">
                      {sent.items.map((it) => (
                        <li key={it.id}>
                          {it.qty} × {it.name}
                        </li>
                      ))}
                    </ul>
                    <a className="menu-cart-reopen" href={sent.url} target="_blank" rel="noopener">
                      ¿No se abrió WhatsApp? Abrilo acá
                    </a>
                  </div>
                  <div className="menu-cart-foot">
                    <button type="button" className="btn btn-linear-primary menu-cart-send" onClick={close}>
                      Listo
                    </button>
                  </div>
                </>
              ) : lines.length === 0 ? (
                <div className="menu-cart-body menu-cart-empty">
                  <p>Tu pedido está vacío. Sumá productos desde la carta.</p>
                  <button type="button" className="btn btn-secondary" onClick={close}>
                    Seguir mirando la carta
                  </button>
                </div>
              ) : (
                <>
                  <div className="menu-cart-body">
                    <ul className="menu-cart-lines">
                      {lines.map((line) => (
                        <li key={line.id}>
                          <span className="menu-cart-line-name">
                            {line.name}
                            <small>{formatARS(line.price)} c/u</small>
                          </span>
                          <QtyStepper name={line.name} qty={line.qty} onChange={(q) => onQty(line.id, q)} />
                          <strong className="menu-cart-line-total">{formatARS(line.price * line.qty)}</strong>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="menu-cart-clear" onClick={onClear}>
                      Vaciar pedido
                    </button>

                    <div className="menu-cart-fields">
                      <label className="menu-cart-field">
                        <span>Tu nombre</span>
                        <input
                          ref={nameRef}
                          type="text"
                          value={name}
                          maxLength={40}
                          autoComplete="given-name"
                          aria-invalid={nameError ? true : undefined}
                          aria-describedby={nameError ? "menu-cart-name-error" : undefined}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameError) setNameError("");
                          }}
                        />
                      </label>
                      {nameError && (
                        <p id="menu-cart-name-error" className="menu-cart-error" role="alert">
                          {nameError}
                        </p>
                      )}
                      <label className="menu-cart-field">
                        <span>Entrega</span>
                        <select value={deliverTo} onChange={(e) => setDeliverTo(e.target.value)}>
                          {deliveryOptions.map((o) => (
                            <option key={o.id} value={o.label}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="menu-cart-field">
                        <span>
                          Aclaraciones <em>(opcional)</em>
                        </span>
                        <input
                          type="text"
                          value={notes}
                          maxLength={140}
                          placeholder="Ej.: sin cebolla, bien fría"
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="menu-cart-foot">
                    <div className="menu-cart-total">
                      <span>Total</span>
                      <strong>{formatARS(total)}</strong>
                    </div>
                    <button type="button" className="btn btn-whatsapp menu-cart-send" onClick={send}>
                      <MessageCircle size={20} aria-hidden="true" />
                      Enviar pedido por WhatsApp
                    </button>
                    <p className="menu-cart-hint">
                      Se abre WhatsApp con el pedido armado y la cantina lo ve en su panel.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
