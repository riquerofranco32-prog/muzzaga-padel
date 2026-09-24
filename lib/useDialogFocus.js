"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Manejo de foco para un diálogo portado a <body>.
 *
 * Al abrir mueve el foco adentro (al campo con autoFocus si lo hay, si no al
 * contenedor), lo mantiene adentro con Tab / Shift+Tab, cierra con Escape y,
 * al cerrar, devuelve el foco al elemento que lo abrió. Sin esto, un modal
 * portado queda último en el orden de tabulación: detrás de toda la página
 * que tapa el velo.
 *
 * @param {boolean} open
 * @param {() => void} [onClose]
 * @returns {import("react").RefObject<HTMLElement>} ref para el contenedor del diálogo
 */
export default function useDialogFocus(open, onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement;

    if (!node.contains(document.activeElement)) {
      node.focus({ preventScroll: true });
    }

    function onKeyDown(e) {
      if (e.key === "Escape" && onCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (opener && typeof opener.focus === "function" && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return ref;
}
