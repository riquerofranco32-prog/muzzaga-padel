"use client";

import { useEffect, useState } from "react";
import { COURTS, nowInClubTimezone, nextDays } from "../lib/booking";
import { PRECIO_POR_JUGADOR } from "../data/pricing";

export default function TodayFlashSlots() {
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState("");
  const [dateLabel, setDateLabel] = useState("Hoy");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [courts, setCourts] = useState(COURTS);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoading(true);
    try {
      const now = nowInClubTimezone();
      let targetDate = now.isoDate;
      let label = "Hoy";

      // Si ya son más de las 22:30 hs o el club está cerrado, buscar turnos de mañana
      const days = nextDays(3);
      if (now.hhmm >= "22:30" && days[1]) {
        targetDate = days[1].iso;
        label = `Mañana (${days[1].dayName})`;
      }

      setActiveDate(targetDate);
      setDateLabel(label);

      const res = await fetch(`/api/availability?date=${targetDate}`);
      if (!res.ok) throw new Error("Error fetching slots");
      const data = await res.json();

      const free = (data.slots || []).filter((s) => s.available && !s.past);
      setAvailableSlots(free);
      if (data.courts?.length) setCourts(data.courts);
    } catch (err) {
      console.error("Error loading flash slots", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectSlot(slot) {
    const el = document.getElementById("turnos");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (loading) {
    return null;
  }

  if (availableSlots.length === 0) {
    return (
      <div className="container flash-wrap">
        <div className="flash-card is-full">
          <div>
            <strong className="flash-title">Canchas al 100% para {dateLabel}</strong>
            <div className="flash-meta">
              Todos los turnos de {dateLabel.toLowerCase()} ya fueron reservados. Asegurá tu lugar para los próximos días.
            </div>
          </div>
          <a href="#turnos" className="btn btn-secondary">
            Ver calendario completo →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container flash-wrap">
      <div className="flash-card">
        <img
          src="/img/mascotas/muzzaguito-golpe-pelota.webp"
          alt=""
          width={140}
          height={140}
          className="flash-mascot"
        />

        <div className="flash-body">
          <div className="flash-head">
            <div className="flash-head-left">
              <span className="flash-live pulse-badge-live">Disponible ya</span>
              <strong className="flash-title">Turnos libres · {dateLabel}</strong>
            </div>
            <span className="flash-meta">
              Desde <strong>${PRECIO_POR_JUGADOR.toLocaleString("es-AR")}</strong> por jugador (4p)
            </span>
          </div>

          <div className="flash-chips">
            {availableSlots.map((slot) => {
              const court = courts.find((c) => c.id === slot.courtId);
              return (
                <button
                  key={`${slot.courtId}-${slot.start}`}
                  type="button"
                  onClick={() => handleSelectSlot(slot)}
                  className="flash-chip"
                >
                  <div>
                    <div className="flash-chip-time">{slot.start}</div>
                    <div className="flash-chip-court">
                      {court?.name || "Cancha"} · hasta {slot.end}
                    </div>
                  </div>
                  <span className="flash-chip-cta">Reservar →</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
