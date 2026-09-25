/**
 * Comportamiento de scroll que respeta "reducir movimiento" del sistema.
 * scrollIntoView({ behavior: "smooth" }) corre por JS y no lo alcanza el
 * scroll-behavior del CSS, así que hay que decidirlo acá.
 *
 * @returns {"auto" | "smooth"}
 */
export function scrollBehavior() {
  if (typeof window === "undefined" || !window.matchMedia) return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
