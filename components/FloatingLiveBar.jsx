"use client";

import { useEffect, useState } from "react";
import { clubStatusLine, getClubStatus } from "../data/horarios";

/**
 * Píldora de escritorio que aparece al dejar atrás el hero. Antes decía
 * "Canchas 1 & 2: Turnos Abiertos" fijo, sin mirar nada. Ahora muestra el
 * mismo estado que la barra del hero (sale del horario de Configuración) y
 * el acceso a reservar.
 */
export default function FloatingLiveBar({ schedule, blockedDates }) {
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

  // Solo se dibuja en el cliente (después de scrollear), así que la hora es
  // la de quien mira.
  const status = getClubStatus(new Date(), {
    ...(schedule ? { schedule } : {}),
    blockedDates: blockedDates || [],
  });

  return (
    <aside className="floating-live-pill" aria-label="Acceso rápido a reservas">
      <div className="floating-live-inner">
        <div className="floating-live-status">
          <span className={`pulse-dot radar-dot${status.isOpen ? " is-open" : ""}`} />
          <span className="floating-status-txt">{clubStatusLine(status)}</span>
        </div>

        <a href="#turnos" className="floating-live-action">
          Reservar turno →
        </a>
      </div>
    </aside>
  );
}
