"use client";

import { useEffect, useState } from "react";
import { COURTS, nowInClubTimezone, nextDays } from "../lib/booking";
import { PRECIO_POR_JUGADOR } from "../data/pricing";

export default function TodayFlashSlots() {
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState("");
  const [dateLabel, setDateLabel] = useState("Hoy");
  const [availableSlots, setAvailableSlots] = useState([]);

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
      <div className="container" style={{ margin: "16px auto 8px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(24, 24, 27, 0.04) 0%, rgba(24, 24, 27, 0.08) 100%)",
            border: "1px solid var(--color-hairline-strong, #e4e4e7)",
            borderRadius: "var(--radius-xl, 16px)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎾</span>
            <div>
              <strong style={{ fontSize: 14, color: "var(--color-ink)" }}>
                ¡Canchas al 100% para {dateLabel}!
              </strong>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Todos los turnos de {dateLabel.toLowerCase()} ya fueron reservados. Asegurá tu lugar para los próximos días.
              </div>
            </div>
          </div>
          <a
            href="#turnos"
            className="btn btn-secondary"
            style={{ height: 34, fontSize: 12.5, padding: "0 14px" }}
          >
            Ver Calendario Completo →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: "20px auto 10px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(232, 114, 42, 0.07) 0%, rgba(245, 158, 11, 0.04) 100%)",
          border: "1.5px solid rgba(232, 114, 42, 0.25)",
          borderRadius: "var(--radius-xl, 16px)",
          padding: "16px 20px",
          boxShadow: "0 4px 20px -2px rgba(232, 114, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <img
            src="/img/mascota.png"
            alt="Muzzaguito - Mascota Muzzaga"
            width={64}
            height={64}
            style={{
              width: 64,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
              display: "block",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
            }}
          >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "var(--color-accent-orange, #e8722a)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
              Disponibilidad Inmediata
            </span>
            <strong style={{ fontSize: 15, color: "var(--color-ink)" }}>
              Turnos Libres para {dateLabel}
            </strong>
          </div>

          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Desde <strong>${PRECIO_POR_JUGADOR.toLocaleString("es-AR")}</strong> por jugador (4p)
          </span>
        </div>

        {/* CHIPS DE TURNOS DISPONIBLES */}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
            scrollbarWidth: "none",
          }}
        >
          {availableSlots.map((slot) => {
            const court = COURTS.find((c) => c.id === slot.courtId);
            return (
              <button
                key={`${slot.courtId}-${slot.start}`}
                type="button"
                onClick={() => handleSelectSlot(slot)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--color-surface-card, #ffffff)",
                  border: "1px solid var(--color-hairline-strong, #e2e8f0)",
                  borderRadius: "var(--radius-md, 10px)",
                  padding: "8px 14px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-accent-orange, #e8722a)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 114, 42, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-hairline-strong, #e2e8f0)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>
                    {slot.start} hs
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {court?.name || "Cancha"} · {slot.end} hs
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-accent-orange, #e8722a)",
                    background: "rgba(232, 114, 42, 0.1)",
                    padding: "3px 7px",
                    borderRadius: 6,
                  }}
                >
                  Reservar →
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
