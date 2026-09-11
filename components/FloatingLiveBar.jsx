"use client";

import { useEffect, useState } from "react";

export default function FloatingLiveBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 420) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside className="floating-live-pill" aria-label="Acceso rápido a reservas y estado de canchas">
      <div className="floating-live-inner">
        <div className="floating-live-status">
          <span className="pulse-dot" style={{ color: "#16a34a" }} />
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
