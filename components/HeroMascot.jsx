"use client";

import { useEffect, useRef } from "react";

/** Mascota del hero que se inclina hacia el puntero (solo mouse/trackpad y
 *  sin reduced-motion). Escribe --tilt-x/--tilt-y; el CSS hace el resto. */
export default function HeroMascot({ src, width, height }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canTilt =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!canTilt) return;

    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--tilt-x", x.toFixed(3));
        el.style.setProperty("--tilt-y", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="hero-mascot-tilt">
      <img src={src} alt="" width={width} height={height} className="hero-mascot" />
    </div>
  );
}
