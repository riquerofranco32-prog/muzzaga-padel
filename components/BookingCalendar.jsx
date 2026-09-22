"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBooking } from "../app/actions";
import BookingPassModal from "./BookingPassModal";
import { COURTS, nextDays, priceForSlot, toISODate } from "../lib/booking";
import { toWhatsappNumber } from "../lib/phone";
import { trackEvent } from "../lib/analytics";

const DAYS = nextDays(14);
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
  const formRef = useRef(null);

  // Antes el formulario aparecía al final de la lista de horarios, fuera de
  // pantalla: elegir un slot no daba ninguna señal de que había que
  // scrollear a mano para verlo.
  useEffect(() => {
    if (!selected || !formRef.current) return;
    formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    const firstInput = formRef.current.querySelector("input");
    firstInput?.focus({ preventScroll: true });
  }, [selected]);

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

  const selectedPricing = useMemo(() => {
    if (!selected) return null;
    return priceForSlot(activeDate, selected.start);
  }, [activeDate, selected]);

  // Normalización de teléfono argentino (mínimo 10 dígitos útiles)
  const normalizedPhone = toWhatsappNumber(form.playerPhone);
  const isFormValid =
    form.playerName.trim().length >= 2 && normalizedPhone.length >= 10;

  function pickSlot(slot) {
    setSelected(slot);
    setSubmitError(null);
    setConfirmed(null);
    trackEvent("slot_selected", {
      courtId: slot.courtId,
      start: slot.start,
      date: activeDate,
    });
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
      playerPhone: normalizedPhone,
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
    trackEvent("booking_submitted", {
      courtId: selected.courtId,
      start: selected.start,
      date: activeDate,
      bookingCode: result.bookingCode,
    });
    const whatsappUrl = buildWhatsappUrl(result.bookingCode, result.booking);
    setConfirmed({
      bookingCode: result.bookingCode,
      booking: result.booking,
      whatsappUrl,
    });
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
            <span className="booking-date-day">
              {day.dayName}
              {day.isWeekend && (
                <span className="booking-date-weekend-badge">Finde</span>
              )}
            </span>
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
          Todas las Canchas
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
        <div
          className="booking-matrix-container"
          style={{
            "--court-columns": courtFilter === "all" ? COURTS.length : 1,
          }}
        >
          {/* Encabezado de columnas de canchas */}
          <div className="booking-matrix-header">
            <div>Horario</div>
            {(courtFilter === "all"
              ? COURTS
              : COURTS.filter((c) => c.id === courtFilter)
            ).map((c) => (
              <div key={c.id}>
                {c.name} ({c.type})
              </div>
            ))}
          </div>

          {/* Filas de la matriz por horario */}
          {[...new Set(visibleSlots.map((s) => s.start))].sort().map((time) => {
            const courts =
              courtFilter === "all"
                ? COURTS
                : COURTS.filter((c) => c.id === courtFilter);

            return (
              <div key={time} className="booking-matrix-row">
                <div className="booking-matrix-time-col">
                  <strong>{time}</strong>
                  <span>hs</span>
                </div>

                {courts.map((court) => {
                  const slot = visibleSlots.find(
                    (s) => s.courtId === court.id && s.start === time,
                  );
                  if (!slot) {
                    return (
                      <div
                        key={court.id}
                        className="booking-slot taken"
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
                          No disponible
                        </span>
                      </div>
                    );
                  }

                  const isSelected =
                    selected?.courtId === slot.courtId &&
                    selected?.start === slot.start;

                  return (
                    <button
                      key={`${slot.courtId}-${slot.start}`}
                      type="button"
                      className={`booking-slot${slot.available ? "" : " taken"}${slot.past ? " past" : ""}${isSelected ? " selected" : ""}`}
                      disabled={!slot.available}
                      onClick={() => pickSlot(slot)}
                      aria-label={`${court.name}, ${slot.start} hs, ${isSelected ? "Seleccionado" : slot.available ? "Disponible" : slot.past ? "Finalizado" : "Ocupado"}`}
                    >
                      <span className="slot-meta" style={{ fontWeight: 600 }}>
                        {court.name}
                      </span>
                      <span className="slot-badge">
                        {isSelected
                          ? "Tu selección ✓"
                          : slot.available
                            ? "Disponible"
                            : slot.past
                              ? "Finalizado"
                              : "Ocupado"}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {selected && selectedPricing && (
        <div
          className="booking-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <form className="booking-form" ref={formRef} onSubmit={handleConfirm}>
            <div className="booking-form-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Confirmar reserva</h3>
                  <p style={{ margin: "4px 0 0" }}>
                    {selected.start} hs ·{" "}
                    {COURTS.find((c) => c.id === selected.courtId)?.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                    color: "var(--color-muted)",
                    padding: "0 4px",
                    lineHeight: 1,
                  }}
                  aria-label="Cerrar formulario"
                >
                  ✕
                </button>
              </div>
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                background:
                  "var(--color-surface-hover, rgba(255,255,255,0.05))",
                borderRadius: "var(--radius-md, 8px)",
                border:
                  "1px solid var(--color-hairline, rgba(255,255,255,0.1))",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                }}
              >
                ${selectedPricing.total.toLocaleString("es-AR")}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-body)" }}>
                ${selectedPricing.perPlayer.toLocaleString("es-AR")} por jugador
                si son cuatro
              </div>
            </div>
          </div>

          <label>
            <span>Tu nombre y apellido</span>
            <input
              type="text"
              required
              placeholder="Ej. Lucas Rossi"
              value={form.playerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, playerName: e.target.value }))
              }
            />
          </label>

          <label>
            <span>Teléfono de contacto (WhatsApp)</span>
            <input
              type="tel"
              required
              placeholder="Ej. 299 597 4176"
              value={form.playerPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, playerPhone: e.target.value }))
              }
            />
          </label>

          <label>
            <span>Cantidad de jugadores</span>
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

          <div className="type-switcher">
            <button
              type="button"
              className={`type-btn${form.fullCourt ? " active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, fullCourt: true }))}
              aria-pressed={form.fullCourt}
            >
              <strong>Cancha completa</strong>
              <span>${selectedPricing.total.toLocaleString("es-AR")}</span>
            </button>
            <button
              type="button"
              className={`type-btn${!form.fullCourt ? " active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, fullCourt: false }))}
              aria-pressed={!form.fullCourt}
            >
              <strong>Por jugador</strong>
              <span>
                ${selectedPricing.perPlayer.toLocaleString("es-AR")} c/u
              </span>
            </button>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--color-body)",
              marginTop: -6,
              marginBottom: 4,
            }}
          >
            ${selectedPricing.perPlayer.toLocaleString("es-AR")} por jugador si
            son cuatro
          </div>

          {submitError && <p className="booking-error">{submitError}</p>}

            <button
              type="submit"
              className="btn btn-linear-primary"
              disabled={submitting || !isFormValid}
              style={{ width: "100%" }}
            >
              {submitting ? "Confirmando…" : "Confirmar y avisar por WhatsApp →"}
            </button>
          </form>
        </div>
      )}

      {confirmed && (
        <>
          <div className="booking-confirm-form">
            <svg
              className="confirm-check-icon"
              viewBox="0 0 52 52"
              width="40"
              height="40"
              aria-hidden="true"
            >
              <circle
                className="confirm-check-circle"
                cx="26"
                cy="26"
                r="24"
                fill="none"
              />
              <path
                className="confirm-check-mark"
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
            <p className="booking-confirm-summary">
              ¡Turno reservado! Código <strong>{confirmed.bookingCode}</strong>.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              <a
                href={confirmed.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="btn btn-whatsapp"
                style={{ flex: 1, justifyContent: "center", gap: 8 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z" />
                </svg>
                Abrir WhatsApp →
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmed({ ...confirmed, showModal: true })}
              >
                Ver Pase Digital &amp; Seña
              </button>
            </div>
          </div>

          <BookingPassModal
            bookingCode={confirmed.bookingCode}
            booking={confirmed.booking}
            whatsappUrl={confirmed.whatsappUrl}
            onClose={() => setConfirmed(null)}
          />
        </>
      )}
    </div>
  );
}
