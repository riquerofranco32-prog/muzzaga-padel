"use client";

import { useSyncExternalStore } from "react";

/**
 * true mientras la media query coincide. En el servidor (y en la hidratación)
 * devuelve `serverValue` para que el HTML no difiera; después se actualiza.
 * @param {string} query p. ej. "(max-width: 768px)"
 * @param {boolean} [serverValue=false]
 */
export default function useMediaQuery(query, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
