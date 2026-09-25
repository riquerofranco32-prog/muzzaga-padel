"use client";

import { useEffect, useState } from "react";
import { clubStatusLine, getClubStatus } from "../data/horarios";

/**
 * Estado del club en el hero, calculado del horario de Configuración (y los
 * días bloqueados): "Abierto ahora · cierra a las 00:30" o "Cerrado · abre
 * mañana a las 14:00". Antes sumaba "Iluminación LED activa" o "Cristales
 * panorámicos" según la hora y "Pistas cubiertas · cero viento": nada de eso
 * se mide, así que salió.
 */
export default function LiveWeatherRadar({ schedule, blockedDates }) {
  // null hasta el montaje: la home es estática (ISR), así que el servidor no
  // sabe la hora de quien la mira. Reserva el lugar sin texto y aparece con
  // el estado real.
  const [now, setNow] = useState(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const ready = now !== null;
  const status = ready
    ? getClubStatus(now, { ...(schedule ? { schedule } : {}), blockedDates: blockedDates || [] })
    : null;

  return (
    <div
      className={`live-weather-radar-bar${ready ? " is-ready" : ""}`}
      aria-hidden={ready ? undefined : true}
    >
      <div className="radar-status-item">
        <span className={`pulse-dot radar-dot${status?.isOpen ? " is-open" : ""}`} />
        <span>{status ? clubStatusLine(status) : "Abierto ahora · cierra a las 00:30"}</span>
      </div>
    </div>
  );
}
