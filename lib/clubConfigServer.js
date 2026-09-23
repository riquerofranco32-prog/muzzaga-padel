// Lectura de clubConfig desde Realtime Database. Server-only (usa el Admin
// SDK): importalo solo desde route handlers, server actions o server
// components.
import { getDb, isFirebaseConfigured } from "./firebase.js";
import { normalizeConfig } from "./clubConfig.js";

// ponytail: cache en memoria por instancia; tras guardar en otra instancia
// puede tardar hasta CACHE_TTL_MS en verse. Si molesta, pasar a revalidateTag.
const CACHE_TTL_MS = 30_000;
let cache = { at: 0, value: null };

/** Config normalizado; ante cualquier falla devuelve los defaults. */
export async function getClubConfig({ fresh = false } = {}) {
  if (!fresh && cache.value && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }
  if (!isFirebaseConfigured()) return normalizeConfig({});
  try {
    const snap = await getDb().ref("clubConfig").once("value");
    const value = normalizeConfig(snap.exists() ? snap.val() : {});
    cache = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.warn(
      "clubConfig: no se pudo leer, uso valores por defecto:",
      error.message,
    );
    return cache.value || normalizeConfig({});
  }
}

export function setCachedClubConfig(value) {
  cache = { at: Date.now(), value };
}
