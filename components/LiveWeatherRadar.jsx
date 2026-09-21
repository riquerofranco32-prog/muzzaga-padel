"use client";

import { useEffect, useState } from "react";

export default function LiveWeatherRadar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Argentina/Buenos_Aires",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-weather-radar-bar">
      <div className="radar-status-item">
        <span className="pulse-dot" style={{ color: "#0F7B4F" }} />
        <span>Club Abierto · {time || "20:00"} hs en Catriel</span>
      </div>

      <div className="radar-divider" />

      <div className="radar-status-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
        <span>21°C · Viento Calmo 6 km/h</span>
      </div>

      <div className="radar-divider" />

      <div className="radar-status-item highlight">
        <span className="pulse-dot" style={{ color: "var(--brand-orange, #E8722A)", marginRight: 4 }} />
        <span>Canchas 1 y 2: Iluminación LED Activa</span>
      </div>
    </div>
  );
}
