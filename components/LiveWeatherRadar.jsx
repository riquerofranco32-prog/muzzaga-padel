"use client";

import { useEffect, useState } from "react";
import { isClosedDay, toISODate } from "../lib/booking";

// "Club Abierto" antes era texto fijo, mostrado igual un domingo a las 4am
// que un sábado a las 21hs. Lo calculamos contra el mismo horario que ya
// gobierna la disponibilidad real de turnos (lib/booking.js): lunes a
// sábado 14:00–00:30, domingo cerrado.
function isClubOpenNow(now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < 30) {
    // Madrugada: sigue siendo la "noche" del día anterior (cierra 00:30).
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return !isClosedDay(toISODate(yesterday));
  }
  return !isClosedDay(toISODate(now)) && minutes >= 14 * 60;
}

export default function LiveWeatherRadar() {
  const [time, setTime] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Argentina/Buenos_Aires",
        }),
      );
      setIsOpen(isClubOpenNow(now));
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
          style={{ color: isOpen ? "#0F7B4F" : "#9c9c96" }}
        />
        <span>
          {isOpen ? "Club Abierto" : "Club Cerrado"} · {time || "20:00"} hs en
          Catriel
        </span>
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
