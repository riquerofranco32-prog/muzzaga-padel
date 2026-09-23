"use server";

import { getDb, isFirebaseConfigured } from "../../lib/firebase";
import { todayInClub } from "../../lib/booking";
import { PRECIO_POR_JUGADOR } from "../../data/pricing";

export async function getOpenMatches() {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      const snap = await db.ref("openMatches").get();
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data)
          .map(([id, val]) => ({
            id,
            ...val,
          }))
          // Filtrar partidos que tengan fecha válida futura o de hoy
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return { ok: true, matches: list };
      }
    } catch (error) {
      console.warn("Aviso Firebase Open Matches:", error.message);
    }
  }

  // Si no hay partidos creados en Firebase, devolvemos lista vacía (sin jugadores ficticios)
  return { ok: true, matches: [] };
}

export async function joinOpenMatch(matchId, slotIndex, playerName, playerPhone) {
  const name = (playerName || "").trim();
  const phone = (playerPhone || "").trim();
  if (name.length < 2) return { ok: false, error: "Ingresá tu nombre para unirte." };

  try {
    const db = getDb();
    const matchRef = db.ref(`openMatches/${matchId}`);
    const snap = await matchRef.get();

    if (!snap.exists()) {
      return { ok: false, error: "Partido no encontrado." };
    }
    const currentMatch = snap.val();

    if (!currentMatch.players[slotIndex] || currentMatch.players[slotIndex].taken) {
      return { ok: false, error: "Ese lugar ya fue ocupado." };
    }

    currentMatch.players[slotIndex] = {
      name,
      phone,
      taken: true,
      joinedAt: Date.now(),
    };

    await matchRef.set(currentMatch);
    return { ok: true, match: currentMatch };
  } catch (error) {
    console.error("Error al unirse a Cancha Abierta", error);
    return { ok: false, error: "No se pudo registrar tu lugar. Probá de nuevo." };
  }
}

export async function createOpenMatch(data) {
  const { category, courtName, date, time, desc, creatorName, creatorPhone } = data;
  const name = (creatorName || "").trim();
  if (name.length < 2) return { ok: false, error: "Ingresá tu nombre." };

  const badgeColor = category.includes("7ma")
    ? "badge-emerald"
    : category.includes("6ta")
    ? "badge-amber"
    : "badge-indigo";

  const newMatch = {
    category,
    badgeColor,
    courtName: courtName || "Cancha 1 · Cristal",
    date: date || todayInClub(),
    time: time || "20:00 hs",
    desc: (desc || "Convocatoria abierta para jugar al pádel.").trim(),
    pricePerPlayer: PRECIO_POR_JUGADOR,
    createdAt: Date.now(),
    players: [
      { name: `${name} (Org.)`, phone: creatorPhone || "", taken: true },
      { name: "", phone: "", taken: false },
      { name: "", phone: "", taken: false },
      { name: "", phone: "", taken: false },
    ],
  };

  try {
    if (isFirebaseConfigured()) {
      const db = getDb();
      const matchRef = db.ref("openMatches").push();
      await matchRef.set(newMatch);
      return { ok: true, matchId: matchRef.key };
    }
    return { ok: true, matchId: "local-" + Date.now() };
  } catch (error) {
    console.error("Error al crear Cancha Abierta en Firebase", error);
    return { ok: false, error: "No se pudo publicar la convocatoria." };
  }
}
