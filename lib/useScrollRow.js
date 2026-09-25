"use client";

import { useEffect } from "react";

// Último evento de rueda de toda la página. Si la página venía scrolleando
// y el cursor pasa por encima de una fila, la fila no se queda con la rueda:
// solo la toma cuando el gesto empieza sobre ella.
let lastWheel = { at: -Infinity, row: null };
let wheelTrackers = 0;
function trackPageWheel(e) {
  lastWheel = { at: e.timeStamp, row: e.muzzagaRow || null };
}

const GESTURE_GAP_MS = 220;
const DRAG_THRESHOLD_PX = 6;
// En filas con scroll-snap la rueda avanza de a un elemento: a lo sumo un
// paso cada tanto, para que un trackpad no las cruce enteras de un tirón.
const SNAP_STEP_MS = 140;

/**
 * Fila que se desliza de costado (o lista con scroll vertical, con `axis: "y"`).
 *
 * - Marca con `data-more-start` / `data-more-end` si hay contenido escondido
 *   de cada lado, para que el CSS muestre el difuminado del borde.
 * - En horizontal, con mouse: la rueda vertical la mueve de costado (en los
 *   bordes sigue la página) y se puede arrastrar. En el celular se desliza
 *   con el dedo como siempre, eso lo hace el navegador.
 * - En filas con scroll-snap, cada paso de la rueda encaja en el elemento
 *   siguiente (el navegador lo elige según la dirección). Arrastrando se
 *   apaga el encaje y al soltar vuelve a encajar.
 * - Al enfocar algo que quedó cortado, la fila lo trae a la vista (respeta
 *   el scroll-padding, así no queda debajo del difuminado).
 *
 * @param {import("react").RefObject<HTMLElement>} ref
 * @param {{ axis?: "x" | "y" }} [options]
 */
export default function useScrollRow(ref, { axis = "x" } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const horizontal = axis === "x";

    const maxScroll = () =>
      horizontal
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight;
    const position = () => (horizontal ? el.scrollLeft : el.scrollTop);

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = maxScroll();
      const pos = position();
      el.toggleAttribute("data-more-start", max > 1 && pos > 1);
      el.toggleAttribute("data-more-end", max > 1 && pos < max - 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();

    el.addEventListener("scroll", schedule, { passive: true });
    // El ancho del contenido cambia cuando cargan los turnos o cambia el
    // filtro: el ResizeObserver de la fila sola no se entera.
    const resize = new ResizeObserver(schedule);
    resize.observe(el);
    const mutations = new MutationObserver(schedule);
    mutations.observe(el, { childList: true, subtree: true, characterData: true });

    // Chrome no desplaza un elemento que ya se ve en parte cuando recibe el
    // foco: con Tab quedaba cortado y debajo del difuminado.
    function onFocusIn(e) {
      if (e.target === el || !e.target.matches?.(":focus-visible")) return;
      e.target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    el.addEventListener("focusin", onFocusIn);

    if (!horizontal) {
      return () => {
        cancelAnimationFrame(frame);
        el.removeEventListener("scroll", schedule);
        el.removeEventListener("focusin", onFocusIn);
        resize.disconnect();
        mutations.disconnect();
      };
    }

    let lastSnapStep = -Infinity;

    function onWheel(e) {
      if (e.ctrlKey || e.defaultPrevented) return;
      // Trackpad de costado: eso ya lo resuelve el navegador.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = maxScroll();
      if (max <= 1) return;
      // La página venía scrolleando por otro lado: que siga.
      if (e.timeStamp - lastWheel.at < GESTURE_GAP_MS && lastWheel.row !== el) return;
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= el.clientWidth;
      const pos = el.scrollLeft;
      if ((delta < 0 && pos <= 0) || (delta > 0 && pos >= max - 1)) return;
      e.preventDefault();
      e.muzzagaRow = el;
      if (getComputedStyle(el).scrollSnapType.startsWith("none")) {
        el.scrollLeft = Math.max(0, Math.min(max, pos + delta));
        return;
      }
      // Con encaje: si se moviera a mano, un paso de 100 px no llega a la
      // mitad de un turno y la fila volvía a su lugar. scrollBy encaja en el
      // siguiente en la dirección de la rueda.
      if (e.timeStamp - lastSnapStep < SNAP_STEP_MS) return;
      lastSnapStep = e.timeStamp;
      el.scrollBy({ left: delta, behavior: "instant" });
    }

    let drag = null;
    function onPointerDown(e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (maxScroll() <= 1) return;
      drag = { id: e.pointerId, x: e.clientX, left: el.scrollLeft, moved: false };
    }
    function onPointerMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      // Se soltó el botón afuera de la fila (el pointerup le llegó a otro
      // elemento): sin esto la fila seguía al cursor sin apretar nada.
      if ((e.buttons & 1) === 0) {
        drag = null;
        el.classList.remove("is-dragging");
        return;
      }
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
        drag.moved = true;
        el.setPointerCapture?.(e.pointerId);
        el.classList.add("is-dragging");
      }
      el.scrollLeft = drag.left - dx;
    }
    function blockClick(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    function onPointerEnd(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = drag.moved;
      drag = null;
      el.classList.remove("is-dragging");
      if (!moved) return;
      // Soltar después de arrastrar no es tocar el botón que quedó debajo.
      el.addEventListener("click", blockClick, { capture: true, once: true });
      setTimeout(() => el.removeEventListener("click", blockClick, { capture: true }), 0);
    }

    if (wheelTrackers++ === 0) {
      window.addEventListener("wheel", trackPageWheel, { passive: true });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", schedule);
      el.removeEventListener("focusin", onFocusIn);
      resize.disconnect();
      mutations.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
      if (--wheelTrackers === 0) {
        window.removeEventListener("wheel", trackPageWheel);
      }
    };
  }, [ref, axis]);
}
