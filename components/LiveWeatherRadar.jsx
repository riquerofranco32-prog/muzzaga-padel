"use client";

import { useEffect, useState } from "react";
import { getClubStatus, getClubTimeString } from "../data/horarios";

export default function LiveWeatherRadar() {
  const [time, setTime] = useState("");
  const [status, setStatus] = useState({
    isOpen: true,
    isNight: false,
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(getClubTimeString(now));
      setStatus(getClubStatus(now));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-weather-radar-bar">
      <div className="radar-status-item">
        <span
          className="pulse-dot"
          style={{ color: status.isOpen ? "#0F7B4F" : "#9c9c96" }}
        />
        <span>
          {status.isOpen ? "Club Abierto" : "Club Cerrado"} · {time || "17:00 hs"} en Catriel
        </span>
      </div>

      <div className="radar-divider" />

      <div className="radar-status-item highlight">
        <span
          className="pulse-dot"
          style={{ color: "var(--brand-orange, #E8722A)", marginRight: 4 }}
        />
        <span>
          {status.isNight
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
