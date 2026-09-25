"use client";

import { createPortal } from "react-dom";

/**
 * Renderiza a sus hijos como hijos directos de <body>.
 *
 * Los overlays (drawer de reserva, pase digital, modales de canchas abiertas)
 * se abren desde adentro de un `.container`, que tiene `z-index` propio y por
 * lo tanto arma su propio contexto de apilamiento: por más `z-index: 1000` que
 * tenga el overlay, pierde contra el header pegado y la barra inferior. Desde
 * <body> compite en el contexto raíz y gana.
 *
 * Solo se usa para cosas que se abren después de una interacción, así que en
 * el render del servidor nunca hay nada que portar.
 */
export default function Portal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/** Porta solo cuando `enabled` (p. ej. el drawer, que en notebook va en línea). */
export function MaybePortal({ enabled, children }) {
  return enabled ? <Portal>{children}</Portal> : children;
}
