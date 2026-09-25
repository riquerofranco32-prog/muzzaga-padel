"use client";

import { useEffect, useState } from "react";
import { COURTS, nowInClubTimezone, nextDays } from "../lib/booking";
import { requestSlotPick } from "../lib/pickSlot";
import { scrollBehavior } from "../lib/motion";
import Mascota from "./Mascota";
import ScrollRow from "./ScrollRow";

// Chips de relleno mientras llega la disponibilidad: misma estructura y mismo
// alto que los reales, así la tarjeta ocupa su lugar desde el primer render y
// no empuja la página cuando termina el fetch.
const SKELETON_CHIPS = [0, 1, 2, 3];

export default function TodayFlashSlots() {
  // "loading" | "ready" | "error"
  const [status, setStatus] = useState("loading");
  const [activeDate, setActiveDate] = useState("");
  const [dateLabel, setDateLabel] = useState("Hoy");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [courts, setCourts] = useState(COURTS);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setStatus("loading");
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
      setStatus("ready");
    } catch (err) {
      console.error("Error loading flash slots", err);
      setStatus("error");
    }
  }

  function handleSelectSlot(slot) {
    document.getElementById("turnos")?.scrollIntoView({ behavior: scrollBehavior() });
    requestSlotPick({ date: activeDate, courtId: slot.courtId, start: slot.start });
  }

  // Precio por jugador real de cada franja (pico/valle); se anuncia el menor.
  const minPerPlayer = availableSlots.reduce(
    (min, s) => Math.min(min, s.price?.perPlayer || Infinity),
    Infinity,
  );

  // Sin fetch no sabemos si está completo: se dice eso y se manda a la grilla,
  // en vez de afirmar "Canchas al 100 %".
  if (status === "error") {
    return (
      <div className="container flash-wrap">
        <div className="flash-card is-full">
          <div>
            <strong className="flash-title">Turnos de {dateLabel.toLowerCase()}</strong>
            <div className="flash-meta">
              No pudimos cargar los turnos libres. Los ves en la grilla de abajo.
            </div>
          </div>
          <a href="#turnos" className="btn btn-secondary">
            Ver horarios →
          </a>
        </div>
      </div>
    );
  }

  if (status === "ready" && availableSlots.length === 0) {
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

  const loading = status === "loading";

  return (
    <div className="container flash-wrap">
      <div className={`flash-card${loading ? " is-loading" : ""}`} aria-busy={loading || undefined}>
        <Mascota
          pose="golpe-pelota"
          alt=""
          className="flash-mascot"
        />

        <div className="flash-body">
          <div className="flash-head">
            <div className="flash-head-left">
              <span className="flash-live">Disponible ya</span>
              <strong className="flash-title">
                {loading ? `Turnos · ${dateLabel}` : `Turnos libres · ${dateLabel}`}
              </strong>
            </div>
            {loading ? (
              <span className="flash-meta flash-skeleton-text" aria-hidden="true">
                Desde $00.000 por jugador (4p)
              </span>
            ) : (
              Number.isFinite(minPerPlayer) && (
                <span className="flash-meta">
                  Desde <strong>${minPerPlayer.toLocaleString("es-AR")}</strong> por jugador (4p)
                </span>
              )
            )}
          </div>

          <ScrollRow className="flash-chips">
            {loading
              ? SKELETON_CHIPS.map((i) => (
                  <div key={i} className="flash-chip is-skeleton" aria-hidden="true">
                    <div>
                      <div className="flash-chip-time">00:00</div>
                      <div className="flash-chip-court">Cancha 1 · hasta 00:00</div>
                    </div>
                    <span className="flash-chip-cta">Reservar →</span>
                  </div>
                ))
              : availableSlots.map((slot) => {
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
          </ScrollRow>
        </div>
      </div>
    </div>
  );
}
