"use client";

import { useEffect, useState } from "react";

export default function FloatingLiveBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-420px 0px 0px 0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <aside
      className="floating-live-pill"
      aria-label="Acceso rápido a reservas y estado de canchas"
    >
      <div className="floating-live-inner">
        <div className="floating-live-status">
          <span className="pulse-dot" style={{ color: "#0F7B4F" }} />
          <span className="floating-status-txt">
            <strong>Canchas 1 &amp; 2:</strong> Turnos Abiertos
          </span>
        </div>

        <a href="#turnos" className="floating-live-action">
          Reservar Horario →
        </a>
      </div>
    </aside>
  );
}
