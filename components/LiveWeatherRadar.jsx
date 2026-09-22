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
        }),
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

      <div className="radar-status-item highlight">
        <span
          className="pulse-dot"
          style={{ color: "var(--brand-orange, #E8722A)", marginRight: 4 }}
        />
        <span>Canchas 1 y 2: Iluminación LED Activa</span>
      </div>
    </div>
  );
}
