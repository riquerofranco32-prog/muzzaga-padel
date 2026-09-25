"use client";

import { useRef } from "react";
import useScrollRow from "../lib/useScrollRow";

/**
 * Fila que se desliza de costado: con el dedo, con la rueda del mouse o
 * arrastrando, y con un difuminado en el borde que avisa que hay más.
 * Con `axis="y"` es una lista con scroll vertical propio (solo el
 * difuminado). Ver lib/useScrollRow.js. El resto de las props van al <div>.
 */
export default function ScrollRow({ axis = "x", className = "", children, ...rest }) {
  const ref = useRef(null);
  useScrollRow(ref, { axis });
  const base = axis === "y" ? "scroll-col" : "scroll-row";
  return (
    <div ref={ref} className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
