import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getDb, isFirebaseConfigured } from "./firebase";

/**
 * Límite de intentos del login del panel.
 *
 * El check de contraseña es un HMAC contra una sola constante, así que sin
 * freno se puede probar en bucle. Guardamos el contador en Realtime Database
 * (no en memoria) porque en Vercel cada request puede caer en una instancia
 * distinta y un contador local se reinicia solo.
 *
 * Si Firebase no está configurado caemos a un Map en memoria: peor, pero mejor
 * que nada en desarrollo.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

const memoryStore = new Map();

/** Hasheamos la IP: sirve para contar sin guardar el dato personal en claro. */
async function clientKey() {
  const h = await headers();
  const raw =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida";
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

function evaluate(record, now) {
  if (!record) return { blocked: false, count: 0 };
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      blocked: true,
      retryInMin: Math.ceil((record.lockedUntil - now) / 60000),
      count: record.count || 0,
    };
  }
  // Ventana vencida: el contador arranca de cero.
  if (!record.firstAttempt || now - record.firstAttempt > WINDOW_MS) {
    return { blocked: false, count: 0 };
  }
  return { blocked: false, count: record.count || 0 };
}

async function readRecord(key) {
  if (!isFirebaseConfigured()) return memoryStore.get(key) || null;
  try {
    const snap = await getDb().ref(`adminLoginAttempts/${key}`).get();
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.warn("Rate limit: no se pudo leer de Firebase", err.message);
    return memoryStore.get(key) || null;
  }
}

async function writeRecord(key, record) {
  memoryStore.set(key, record);
  if (!isFirebaseConfigured()) return;
  try {
    await getDb().ref(`adminLoginAttempts/${key}`).set(record);
  } catch (err) {
    console.warn("Rate limit: no se pudo escribir en Firebase", err.message);
  }
}

async function clearRecord(key) {
  memoryStore.delete(key);
  if (!isFirebaseConfigured()) return;
  try {
    await getDb().ref(`adminLoginAttempts/${key}`).remove();
  } catch (err) {
    console.warn("Rate limit: no se pudo limpiar en Firebase", err.message);
  }
}

/** Se llama antes de validar la contraseña. */
export async function checkLoginAllowed() {
  const key = await clientKey();
  const state = evaluate(await readRecord(key), Date.now());
  if (state.blocked) {
    return {
      allowed: false,
      error: `Demasiados intentos fallidos. Probá de nuevo en ${state.retryInMin} minuto${
        state.retryInMin === 1 ? "" : "s"
      }.`,
    };
  }
  return { allowed: true, key };
}

/** Suma un intento fallido y bloquea al llegar al tope. */
export async function registerFailedLogin(key) {
  const now = Date.now();
  const previous = await readRecord(key);
  const state = evaluate(previous, now);
  const count = state.count + 1;

  const record = {
    count,
    firstAttempt: state.count === 0 ? now : previous?.firstAttempt || now,
    lockedUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null,
  };
  await writeRecord(key, record);

  const restantes = MAX_ATTEMPTS - count;
  if (restantes <= 0) {
    return `Demasiados intentos fallidos. El acceso queda bloqueado por ${LOCKOUT_MS / 60000} minutos.`;
  }
  if (restantes <= 2) {
    return `Contraseña incorrecta. Te ${restantes === 1 ? "queda" : "quedan"} ${restantes} intento${
      restantes === 1 ? "" : "s"
    } antes del bloqueo.`;
  }
  return "Contraseña incorrecta.";
}

export async function clearLoginAttempts(key) {
  await clearRecord(key);
}
