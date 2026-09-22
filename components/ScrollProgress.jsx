"use client";

import { useEffect, useState } from "react";

/** Barra fina fija arriba de todo que marca cuánto queda de la página. */
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setPct(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <div className="scroll-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
