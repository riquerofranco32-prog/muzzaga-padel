"use client";

import { useEffect, useState } from "react";
import { getClubStatus, getClubTimeString } from "../data/horarios";

export default function LiveWeatherRadar() {
  // null hasta el montaje: la home es estática (ISR), así que el servidor no
  // sabe la hora de quien la mira. Antes mostraba "Club Abierto · 17:00 hs"
  // inventado y lo cambiaba al hidratar. Ahora reserva el lugar sin texto y
  // aparece con la hora real.
  const [now, setNow] = useState(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const ready = now !== null;
  const status = ready ? getClubStatus(now) : null;
  const time = ready ? getClubTimeString(now) : "00:00 hs";

  return (
    <div
      className={`live-weather-radar-bar${ready ? " is-ready" : ""}`}
      aria-hidden={ready ? undefined : true}
    >
      <div className="radar-status-item">
        <span
          className="pulse-dot"
          style={{ color: status?.isOpen ? "#0F7B4F" : "#9c9c96" }}
        />
        <span>
          {status?.isOpen ? "Club Abierto" : "Club Cerrado"} · {time} en Catriel
        </span>
      </div>

      <div className="radar-divider" />

      <div className="radar-status-item highlight">
        <span
          className="pulse-dot"
          style={{ color: "var(--brand-orange, #E8722A)", marginRight: 4 }}
        />
        <span>
          {status?.isNight
            ? "Canchas 1 y 2: Iluminación LED Activa"
            : "Canchas 1 y 2: Cristales Panorámicos"}
        </span>
      </div>

      <div className="radar-divider" />

      <div className="radar-status-item" style={{ color: "#0F7B4F", fontWeight: 600 }}>
        <span>🛡️ Pistas Cubiertas · Cero Viento</span>
      </div>
    </div>
  );
}
