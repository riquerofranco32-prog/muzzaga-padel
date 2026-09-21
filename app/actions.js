"use server";

import { getDb, isFirebaseConfigured } from "../lib/firebase";
import {
  findCourt,
  isValidSlot,
  priceForSlot,
  slotKey,
} from "../lib/booking";

/**
 * @param {{date: string, courtId: string, startTime: string, endTime: string, playerName: string, playerPhone: string, playersCount: number, fullCourt: boolean}} input
 * @returns {Promise<{ok: true, bookingCode: string, booking: object} | {ok: false, error: string}>}
 */
export async function createBooking(input) {
  const {
    date,
    courtId,
    startTime,
    endTime,
    playerName,
    playerPhone,
    playersCount,
    fullCourt,
  } = input;

  const court = findCourt(courtId);
  if (!court) return { ok: false, error: "Cancha inválida." };
  if (!isValidSlot(date, courtId, startTime)) {
    return {
      ok: false,
      error: "Ese horario no existe o el club está cerrado ese día.",
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(`${date}T00:00:00`) < today) {
    return { ok: false, error: "Elegí una fecha futura." };
  }
  const name = (playerName || "").trim();
  const phone = (playerPhone || "").trim();
  if (name.length < 2) return { ok: false, error: "Ingresá tu nombre." };
  if (phone.length < 6)
    return { ok: false, error: "Ingresá un teléfono de contacto." };
  const players = Number(playersCount) || 1;
  if (players < 1 || players > 4)
    return { ok: false, error: "La cancha admite entre 1 y 4 jugadores." };

  const courtName = `${court.name} (${court.type})`;
  let bookingKey = Math.random().toString(36).substring(2, 10);

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      const claimRef = db.ref(`slotClaims/${date}/${slotKey(courtId, startTime)}`);
      const bookingRef = db.ref("bookings").push();

      const claim = await claimRef.transaction((current) => {
        if (current) return; // ya reservado: aborta la transacción
        return bookingRef.key;
      });

      if (!claim.committed) {
        return { ok: false, error: "Ese horario se acaba de ocupar. Elegí otro." };
      }

      const bookingData = {
        courtId,
        courtName,
        date,
        startTime,
        endTime,
        playerName: name,
        playerPhone: phone,
        playersCount: players,
        fullCourt: Boolean(fullCourt),
        status: "confirmado",
        createdAt: Date.now(),
      };

      await bookingRef.set(bookingData);
      bookingKey = bookingRef.key;
    } catch (error) {
      console.warn("Aviso: Firebase no disponible al guardar reserva, generando pase directo:", error.message);
    }
  }

  const bookingCode = `MUZZ-${bookingKey.slice(-5).toUpperCase()}`;
  const slotPricing = priceForSlot(date, startTime);
  const total = fullCourt ? slotPricing.total : slotPricing.perPlayer * players;

  // The WhatsApp message is built client-side in BookingCalendar, not here:
  // this action only returns plain data.
  return {
    ok: true,
    bookingCode,
    booking: {
      courtName,
      date,
      startTime,
      endTime,
      players,
      fullCourt: Boolean(fullCourt),
      total,
      name,
      phone,
    },
  };
}
