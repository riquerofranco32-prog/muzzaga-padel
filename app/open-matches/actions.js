"use server";

import { getDb } from "../../lib/firebase";
import { toISODate } from "../../lib/booking";

const DEFAULT_MATCHES = [
  {
    id: "match-demo-1",
    category: "6ta Categoría (3.0 - 3.8)",
    badgeColor: "badge-amber",
    courtName: "Cancha 1 · Cristal",
    date: toISODate(new Date()),
    time: "20:00 hs",
    desc: "Partido parejo de 6ta para sumar ritmo y competencia. Tercer tiempo asegurado en la cantina.",
    pricePerPlayer: 15000,
    players: [
      { name: "Agustín M. (Org.)", phone: "2995974176", taken: true },
      { name: "Franco R.", phone: "", taken: true },
      { name: "Matías L.", phone: "", taken: true },
      { name: "", phone: "", taken: false }, // +1 libre
    ],
  },
  {
    id: "match-demo-2",
    category: "7ma / Iniciación (1.5 - 2.5)",
    badgeColor: "badge-emerald",
    courtName: "Cancha 2 · Estándar",
    date: toISODate(new Date()),
    time: "21:30 hs",
    desc: "Partido distendido para divertirse y aprender a jugar con paredes. ¡Ideal para quienes recién arrancan!",
    pricePerPlayer: 15000,
    players: [
      { name: "Gonzalo V. (Org.)", phone: "2995974176", taken: true },
      { name: "Nicolás P.", phone: "", taken: true },
      { name: "", phone: "", taken: false }, // +1 libre
      { name: "", phone: "", taken: false }, // +2 libre
    ],
  },
];

export async function getOpenMatches() {
  try {
    const db = getDb();
    const snap = await db.ref("openMatches").get();
    if (snap.exists()) {
      const data = snap.val();
      const list = Object.entries(data).map(([id, val]) => ({
        id,
        ...val,
      }));
      return { ok: true, matches: list };
    }
  } catch (error) {
    console.error("Error al obtener Canchas Abiertas de Firebase", error);
  }

  // Fallback a los partidos predeterminados si aún no hay en Firebase
  return { ok: true, matches: DEFAULT_MATCHES };
}

export async function joinOpenMatch(matchId, slotIndex, playerName, playerPhone) {
  const name = (playerName || "").trim();
  const phone = (playerPhone || "").trim();
  if (name.length < 2) return { ok: false, error: "Ingresá tu nombre para unirte." };

  try {
    const db = getDb();
    const matchRef = db.ref(`openMatches/${matchId}`);
    const snap = await matchRef.get();

    let currentMatch;
    if (snap.exists()) {
      currentMatch = snap.val();
    } else {
      // Si era de los demo, inicializarlo en Firebase
      const defaultMatch = DEFAULT_MATCHES.find((m) => m.id === matchId);
      if (!defaultMatch) return { ok: false, error: "Partido no encontrado." };
      currentMatch = { ...defaultMatch };
    }

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
    date: date || toISODate(new Date()),
    time: time || "20:00 hs",
    desc: (desc || "Convocatoria abierta para jugar al pádel.").trim(),
    pricePerPlayer: 15000,
    createdAt: Date.now(),
    players: [
      { name: `${name} (Org.)`, phone: creatorPhone || "", taken: true },
      { name: "", phone: "", taken: false },
      { name: "", phone: "", taken: false },
      { name: "", phone: "", taken: false },
    ],
  };

  try {
    const db = getDb();
    const matchRef = db.ref("openMatches").push();
    await matchRef.set(newMatch);
    return { ok: true, matchId: matchRef.key };
  } catch (error) {
    console.error("Error al crear Cancha Abierta en Firebase", error);
    return { ok: false, error: "No se pudo publicar la convocatoria." };
  }
}
