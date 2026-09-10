"use client";

import { useEffect, useMemo, useState } from "react";
import { createBooking } from "../app/actions";
import {
  COURTS,
  PRICE_FULL,
  PRICE_PER_PLAYER,
  nextDays,
  toISODate,
} from "../lib/booking";

const DAYS = nextDays(7);
const CLUB_WHATSAPP = "5492995974176";

function buildWhatsappUrl(bookingCode, booking) {
  const msg =
    `Hola Muzzaga! Reservé un turno desde la web [#${bookingCode}]:\n\n` +
    `Fecha: ${booking.date}\n` +
    `Horario: ${booking.startTime} a ${booking.endTime} hs\n` +
    `Cancha: ${booking.courtName}\n` +
    `Jugadores: ${booking.players}${booking.fullCourt ? " (cancha completa)" : ""}\n` +
    `Total: $${booking.total.toLocaleString("es-AR")}\n` +
    `A nombre de: ${booking.name} (${booking.phone})\n\n` +
    `¿Me confirman el turno?`;
  return `https://wa.me/${CLUB_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export default function BookingCalendar() {
  const [activeDate, setActiveDate] = useState(DAYS[0].iso);
  const [courtFilter, setCourtFilter] = useState("all");
  const [slots, setSlots] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selected, setSelected] = useState(null); // { courtId, start, end }
  const [form, setForm] = useState({
    playerName: "",
    playerPhone: "",
    playersCount: 4,
    fullCourt: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmed, setConfirmed] = useState(null); // { bookingCode, whatsappUrl }

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setLoadError(null);
    fetch(`/api/availability?date=${activeDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("request-failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError(
            "No pudimos cargar la disponibilidad. Probá de nuevo en un momento.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [activeDate]);

  const activeDay = DAYS.find((d) => d.iso === activeDate);

  const visibleSlots = useMemo(() => {
    if (!slots) return null;
    return courtFilter === "all"
      ? slots
      : slots.filter((s) => s.courtId === courtFilter);
  }, [slots, courtFilter]);

  function pickSlot(slot) {
    setSelected(slot);
    setSubmitError(null);
    setConfirmed(null);
  }

  function markSlotTaken(courtId, start) {
    setSlots((prev) =>
      prev
        ? prev.map((s) =>
            s.courtId === courtId && s.start === start
              ? { ...s, available: false }
              : s,
          )
        : prev,
    );
  }

  async function handleConfirm(e) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await createBooking({
      date: activeDate,
      courtId: selected.courtId,
      startTime: selected.start,
      endTime: selected.end,
      playerName: form.playerName,
      playerPhone: form.playerPhone,
      playersCount: form.playersCount,
      fullCourt: form.fullCourt,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      if (result.error.includes("acaba de ocupar")) {
        markSlotTaken(selected.courtId, selected.start);
        setSelected(null);
      }
      return;
    }
    markSlotTaken(selected.courtId, selected.start);
    const whatsappUrl = buildWhatsappUrl(result.bookingCode, result.booking);
    setConfirmed({ bookingCode: result.bookingCode, whatsappUrl });
    window.open(whatsappUrl, "_blank", "noopener");
  }

  return (
    <div className="booking-calendar">
      <div className="booking-dates" role="tablist" aria-label="Elegí el día">
        {DAYS.map((day) => (
          <button
            key={day.iso}
            type="button"
            className={`booking-date-btn${day.iso === activeDate ? " active" : ""}`}
            onClick={() => {
              setActiveDate(day.iso);
              setSelected(null);
              setConfirmed(null);
            }}
            aria-pressed={day.iso === activeDate}
          >
            <span className="booking-date-day">{day.dayName}</span>
            <span className="booking-date-num">{day.dayNumber}</span>
            <span className="booking-date-month">{day.monthName}</span>
          </button>
        ))}
      </div>

      <div className="booking-court-tabs">
        <button
          type="button"
          className={`booking-court-tab${courtFilter === "all" ? " active" : ""}`}
          onClick={() => setCourtFilter("all")}
          aria-pressed={courtFilter === "all"}
        >
          Todas
        </button>
        {COURTS.map((court) => (
          <button
            key={court.id}
            type="button"
            className={`booking-court-tab${courtFilter === court.id ? " active" : ""}`}
            onClick={() => setCourtFilter(court.id)}
            aria-pressed={courtFilter === court.id}
          >
            {court.name} ({court.type})
          </button>
        ))}
      </div>

      {activeDay?.closed && (
        <p className="booking-empty">
          Los domingos el club está cerrado. Elegí otro día.
        </p>
      )}

      {!activeDay?.closed && loadError && (
        <p className="booking-empty">{loadError}</p>
      )}

      {!activeDay?.closed && !loadError && !visibleSlots && (
        <p className="booking-empty">Cargando disponibilidad…</p>
      )}

      {!activeDay?.closed && !loadError && visibleSlots && (
        <div className="booking-slots-grid">
          {visibleSlots.map((slot) => {
            const court = COURTS.find((c) => c.id === slot.courtId);
            const isSelected =
              selected?.courtId === slot.courtId &&
              selected?.start === slot.start;
            return (
              <button
                key={`${slot.courtId}-${slot.start}`}
                type="button"
                className={`booking-slot${slot.available ? "" : " taken"}${isSelected ? " selected" : ""}`}
                disabled={!slot.available}
                onClick={() => pickSlot(slot)}
              >
                <span className="slot-time">{slot.start} hs</span>
                <span className="slot-meta">
                  {court?.name} · {court?.type}
                </span>
                <span
                  className={`badge-linear ${slot.available ? "badge-emerald" : ""}`}
                >
                  {slot.available ? "Disponible" : "Ocupado"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && !confirmed && (
        <form className="booking-confirm-form" onSubmit={handleConfirm}>
          <p className="booking-confirm-summary">
            {COURTS.find((c) => c.id === selected.courtId)?.name} ·{" "}
            {selected.start} a {selected.end} hs · {activeDay?.fullLabel}
          </p>

          <div className="type-switcher">
            <button
              type="button"
              className={`type-btn${form.fullCourt ? " active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, fullCourt: true }))}
              aria-pressed={form.fullCourt}
            >
              <strong>Cancha completa</strong>
              <span>${PRICE_FULL.toLocaleString("es-AR")}</span>
            </button>
            <button
              type="button"
              className={`type-btn${!form.fullCourt ? " active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, fullCourt: false }))}
              aria-pressed={!form.fullCourt}
            >
              <strong>Por jugador</strong>
              <span>${PRICE_PER_PLAYER.toLocaleString("es-AR")} c/u</span>
            </button>
          </div>

          <label className="booking-field">
            Tu nombre
            <input
              type="text"
              required
              value={form.playerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, playerName: e.target.value }))
              }
            />
          </label>

          <label className="booking-field">
            Teléfono de contacto
            <input
              type="tel"
              required
              value={form.playerPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, playerPhone: e.target.value }))
              }
            />
          </label>

          <label className="booking-field">
            Cantidad de jugadores
            <select
              value={form.playersCount}
              onChange={(e) =>
                setForm((f) => ({ ...f, playersCount: Number(e.target.value) }))
              }
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          {submitError && <p className="booking-error">{submitError}</p>}

          <button
            type="submit"
            className="btn btn-linear-primary"
            disabled={submitting}
            style={{ width: "100%" }}
          >
            {submitting ? "Confirmando…" : "Confirmar y avisar por WhatsApp →"}
          </button>
        </form>
      )}

      {confirmed && (
        <div className="booking-confirm-form">
          <p className="booking-confirm-summary">
            ¡Turno reservado! Código <strong>{confirmed.bookingCode}</strong>.
            Si no se abrió WhatsApp automáticamente:
          </p>
          <a
            href={confirmed.whatsappUrl}
            target="_blank"
            rel="noopener"
            className="btn btn-whatsapp"
            style={{ width: "100%" }}
          >
            Abrir WhatsApp →
          </a>
        </div>
      )}
    </div>
  );
}
