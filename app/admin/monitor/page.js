"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  adminGetClubConfig,
  checkAdminSession,
  getAdminDayData,
} from "../actions";
import {
  COURTS,
  isoAddDays,
  nowInClubTimezone,
  todayInClub,
} from "../../../lib/booking";
import { getClubTimeString } from "../../../data/horarios";
import { isExpiredSessionError } from "../adminHelpers";
import { courtSchedule, liveAndNext, toMinutes } from "./schedule";
import "./monitor.css";

const REFRESH_MS = 30000;
const STALE_AFTER_MIN = 2;
// Después de esta hora ya no queda nada de ayer en pista.
const LATE_NIGHT_UNTIL = "06:00";
const WARN_MIN = 5;

function playTurnChime(freq = 587.33) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  } catch {
    // El navegador puede bloquear el audio sin interacción previa.
  }
}

function timerTone(remaining) {
  if (remaining <= 10) return "#ef4444";
  if (remaining <= 20) return "#f59e0b";
  return "#22c55e";
}

export default function MonitorPage() {
  const [authorized, setAuthorized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [dayData, setDayData] = useState(null);
  const [yesterdayBookings, setYesterdayBookings] = useState([]);
  const [slotDuration, setSlotDuration] = useState(null);
  const [loadError, setLoadError] = useState(null); // null | "expired" | "offline"
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const firedChimes = useRef(new Set());

  useEffect(() => {
    checkAdminSession().then((res) => {
      setAuthorized(res.ok);
      setSessionChecked(true);
    });
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime(getClubTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    adminGetClubConfig().then((res) => {
      if (res.ok) setSlotDuration(res.config.slotDurationMin);
    });
    loadData();
    const id = setInterval(loadData, REFRESH_MS);
    return () => clearInterval(id);
  }, [authorized]);

  async function loadData() {
    const today = todayInClub();
    const isLateNight = nowInClubTimezone().hhmm < LATE_NIGHT_UNTIL;
    try {
      const [res, prev] = await Promise.all([
        getAdminDayData(today),
        isLateNight ? getAdminDayData(isoAddDays(today, -1)) : null,
      ]);
      if (!res.ok) {
        setLoadError(isExpiredSessionError(res) ? "expired" : "offline");
        return;
      }
      setDayData(res);
      setYesterdayBookings(prev?.ok ? prev.bookings : []);
      setLoadError(null);
      setLastUpdated(Date.now());
    } catch {
      setLoadError("offline");
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const now = nowInClubTimezone();
  const currentMinutes = toMinutes(now.hhmm);
  const courts = dayData?.courts || COURTS;
  const schedules = courts.map((court) => {
    const schedule = courtSchedule(
      court.id,
      dayData?.bookings,
      yesterdayBookings,
    );
    return { court, schedule, ...liveAndNext(schedule, currentMinutes) };
  });

  // Aviso sonoro a 5 min del final y al terminar, una vez por turno. Se
  // marcan aunque el sonido esté apagado para que al prenderlo no suenen
  // avisos viejos de golpe.
  useEffect(() => {
    schedules.forEach(({ schedule }) =>
      schedule.forEach(({ booking, end }) => {
        const remaining = end - currentMinutes;
        const key = `${booking.id}-${booking.date}`;
        if (
          remaining > 0 &&
          remaining <= WARN_MIN &&
          !firedChimes.current.has(`${key}-warn`)
        ) {
          firedChimes.current.add(`${key}-warn`);
          if (soundEnabled) playTurnChime(587.33);
        }
        if (
          remaining <= 0 &&
          remaining > -2 &&
          !firedChimes.current.has(`${key}-end`)
        ) {
          firedChimes.current.add(`${key}-end`);
          if (soundEnabled) {
            playTurnChime(880);
            setTimeout(() => playTurnChime(659.25), 350);
          }
        }
      }),
    );
  }, [currentMinutes, dayData, yesterdayBookings, soundEnabled]);

  if (!sessionChecked) {
    return <div className="mon-center">Verificando sesión…</div>;
  }

  if (!authorized) {
    return (
      <div className="mon-center">
        <h2>Acceso restringido</h2>
        <p>
          Iniciá sesión en el panel de administración antes de abrir el monitor
          de recepción.
        </p>
        <Link
          href="/admin"
          className="btn btn-linear-primary"
          style={{ marginTop: 14 }}
        >
          Ir al login del admin →
        </Link>
      </div>
    );
  }

  const minutesSinceUpdate = lastUpdated
    ? Math.floor((Date.now() - lastUpdated) / 60000)
    : null;
  const isStale =
    minutesSinceUpdate != null && minutesSinceUpdate >= STALE_AFTER_MIN;
  const durationLabel = slotDuration ? `${slotDuration} minutos` : "el horario";

  return (
    <div className="mon-root">
      {loadError === "expired" && (
        <div className="mon-overlay" role="alert">
          <h2>Sesión vencida</h2>
          <p>Los datos de esta pantalla dejaron de actualizarse.</p>
          <p>Volvé a ingresar al panel para reactivar el monitor.</p>
          <Link href="/admin" className="btn btn-linear-primary">
            Ir al panel →
          </Link>
        </div>
      )}

      <header className="mon-header">
        <div className="mon-brand">
          <img src="/img/logo_badge.png" alt="Muzzaga" />
          <div>
            <h1>MUZZAGA PÁDEL · MONITOR DE PISTAS</h1>
            <span>Recepción en tiempo real</span>
          </div>
        </div>

        <div className="mon-tools">
          {loadError === "offline" ? (
            <span className="mon-status is-error" role="status">
              Sin conexión con la base · reintentando
              {minutesSinceUpdate != null &&
                ` · últimos datos de hace ${minutesSinceUpdate} min`}
            </span>
          ) : (
            lastUpdated && (
              <span
                className={`mon-status${isStale ? " is-stale" : ""}`}
                role="status"
              >
                {minutesSinceUpdate === 0
                  ? "Actualizado recién"
                  : `Actualizado hace ${minutesSinceUpdate} min`}
              </span>
            )
          )}

          <div className="mon-clock mon-mono">{currentTime || now.hhmm}</div>

          <button
            type="button"
            className={`mon-btn${soundEnabled ? " is-on" : ""}`}
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playTurnChime(659.25);
            }}
            aria-pressed={soundEnabled}
            title="Aviso sonoro cuando faltan 5 min y al terminar cada turno"
          >
            {soundEnabled ? "🔔 Sonido activo" : "🔕 Sonido apagado"}
          </button>

          <button type="button" className="mon-btn" onClick={toggleFullscreen}>
            {isFullscreen
              ? "Salir de pantalla completa"
              : "⛶ Pantalla completa"}
          </button>

          <Link href="/admin" className="mon-back">
            ← Volver al admin
          </Link>
        </div>
      </header>

      <div className="mon-grid">
        {schedules.map(({ court, live, next }) => {
          const match = live?.booking;
          const remaining = live ? Math.max(0, live.end - currentMinutes) : 0;
          const elapsed = live ? Math.max(0, currentMinutes - live.start) : 0;
          const total = live ? Math.max(1, live.end - live.start) : 1;
          const progress = Math.min(100, Math.round((elapsed / total) * 100));
          const tone = { "--tone": timerTone(remaining) };

          return (
            <section
              key={court.id}
              className={`mon-court${match ? " is-live" : ""}`}
            >
              <div>
                <div className="mon-court-head">
                  <div>
                    <h2>{court.name}</h2>
                    {court.type && <span>{court.type}</span>}
                  </div>
                  <div className={`mon-pill${match ? " is-live" : ""}`}>
                    {match ? "EN JUEGO" : "LIBRE AHORA"}
                  </div>
                </div>

                <div className="mon-match">
                  <div className="mon-label">Partido en curso</div>
                  {match ? (
                    <>
                      <div className="mon-player">{match.playerName}</div>
                      <div className="mon-slot">
                        {match.startTime} a {match.endTime} hs ·{" "}
                        {match.playersCount || 4} jugadores
                      </div>

                      <div className="mon-timer" style={tone}>
                        <span>Tiempo restante en pista</span>
                        <strong className="mon-mono">⏳ {remaining} min</strong>
                      </div>

                      <div className="mon-progress" style={tone}>
                        <div className="mon-progress-meta">
                          <span>
                            {elapsed} de {total} min jugados
                          </span>
                          <strong>{progress}%</strong>
                        </div>
                        <div className="mon-progress-track">
                          <div
                            className="mon-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mon-empty">
                      No hay partido en este momento.
                    </div>
                  )}
                </div>
              </div>

              <div className="mon-next">
                <div>
                  <span className="mon-next-label">Próximo turno</span>
                  <div className="mon-next-name">
                    {next ? next.booking.playerName : "Sin reserva siguiente"}
                  </div>
                </div>
                <div className="mon-next-time mon-mono">
                  {next ? `${next.booking.startTime} hs` : "—"}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mon-ticker">
        <div className="mon-ticker-tag">MUZZAGA TV</div>
        <div className="mon-ticker-window">
          <div className="mon-ticker-text">
            🎾 Cada turno dura {durationLabel}: terminá a horario para que el
            turno siguiente arranque puntual &nbsp;·&nbsp; 🥤 Cantina abierta:
            consultá en recepción &nbsp;·&nbsp; 🏆 Preguntá en recepción por los
            próximos torneos &nbsp;·&nbsp; 📱 Reservá tu turno online en
            muzzagapadel.com.ar
          </div>
        </div>
      </div>
    </div>
  );
}
