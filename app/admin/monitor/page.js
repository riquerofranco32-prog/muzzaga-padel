"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDayData, checkAdminSession } from "../actions";
import { todayInClub, COURTS, nowInClubTimezone } from "../../../lib/booking";
import { getClubTimeString } from "../../../data/horarios";

export default function MonitorPage() {
  const [authorized, setAuthorized] = useState(false);
  const [dayData, setDayData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  function playTurnChime(freq = 587.33) {
    if (!soundEnabled || typeof window === "undefined") return;
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
    } catch (e) {
      // Audio autoplay policy handled silently
    }
  }

  useEffect(() => {
    checkAdminSession().then((res) => {
      if (res.ok) setAuthorized(true);
    });
  }, []);

  useEffect(() => {
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (!authorized) return;
    loadData();
    const dataTimer = setInterval(loadData, 30000); // Refresco cada 30s
    return () => clearInterval(dataTimer);
  }, [authorized]);

  function updateClock() {
    setCurrentTime(getClubTimeString());
  }

  async function loadData() {
    const today = todayInClub();
    const res = await getAdminDayData(today);
    if (res.ok) {
      setDayData(res);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0d0e",
          color: "#fff",
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2>Acceso Restringido</h2>
        <p style={{ color: "#9ca3af", maxWidth: 400 }}>
          Iniciá sesión en el panel de administración antes de abrir el monitor de recepción.
        </p>
        <Link href="/admin" className="btn btn-linear-primary" style={{ marginTop: 14 }}>
          Ir al Login de Admin →
        </Link>
      </div>
    );
  }

  const now = nowInClubTimezone();
  const currentMinutes = parseInt(now.hhmm.split(":")[0], 10) * 60 + parseInt(now.hhmm.split(":")[1], 10);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a09",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER MONITOR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: 18,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/img/logo_badge.png"
            alt="Muzzaga"
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <div>
            <h1 style={{ fontSize: 24, margin: 0, fontWeight: 800, letterSpacing: "0.04em" }}>
              MUZZAGA PÁDEL · MONITOR DE PISTAS
            </h1>
            <span style={{ fontSize: 13, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Panel de Recepción &amp; Cantina en Tiempo Real
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              color: "#e8722a",
              background: "rgba(232, 114, 42, 0.1)",
              border: "1px solid rgba(232, 114, 42, 0.3)",
              padding: "6px 18px",
              borderRadius: 12,
            }}
          >
            {currentTime || now.hhmm}
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playTurnChime(659.25);
            }}
            style={{
              background: soundEnabled ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
              border: soundEnabled ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.2)",
              color: soundEnabled ? "#34d399" : "#d1d5db",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Activar o silenciar aviso sonoro cuando faltan 5 min y al terminar el turno"
          >
            {soundEnabled ? "🔔 Sonido Activo" : "🔕 Sonido Desactivado"}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {isFullscreen ? "Salir Pantalla Completa" : "⛶ Pantalla Completa"}
          </button>

          <Link
            href="/admin"
            style={{
              color: "#9ca3af",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            ← Volver al Admin
          </Link>
        </div>
      </div>

      {/* GRID DE CANCHAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))",
          gap: 24,
          flex: 1,
        }}
      >
        {(dayData?.courts || COURTS).map((court) => {
          // Filtrar reservas del día para esta cancha
          const courtBookings = (dayData?.bookings || [])
            .filter((b) => b.courtId === court.id && b.status !== "cancelado")
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Encontrar partido en juego actualmente
          const currentMatch = courtBookings.find((b) => {
            const [sh, sm] = b.startTime.split(":").map(Number);
            const [eh, em] = b.endTime.split(":").map(Number);
            const startM = sh * 60 + sm;
            const endM = eh * 60 + em;
            return currentMinutes >= startM && currentMinutes < endM;
          });

          // Encontrar próximo partido
          const nextMatch = courtBookings.find((b) => {
            const [sh, sm] = b.startTime.split(":").map(Number);
            const startM = sh * 60 + sm;
            return startM > currentMinutes;
          });

          // Calcular minutos restantes si hay partido en juego
          let remainingMinutes = null;
          if (currentMatch) {
            const [eh, em] = currentMatch.endTime.split(":").map(Number);
            const endM = eh * 60 + em;
            remainingMinutes = Math.max(0, endM - currentMinutes);
          }

          return (
            <div
              key={court.id}
              style={{
                background: currentMatch
                  ? "linear-gradient(180deg, #161c18 0%, #111412 100%)"
                  : "linear-gradient(180deg, #161719 0%, #111214 100%)",
                border: currentMatch
                  ? "2px solid #22c55e"
                  : "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 20,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: currentMatch
                  ? "0 0 35px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(34, 197, 94, 0.05)"
                  : "0 8px 30px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              {/* ENCABEZADO DE CANCHA */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 28, margin: 0, fontWeight: 900 }}>
                      {court.name}
                    </h2>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>
                      Pista Oficial de Cristal · 10mm Templado
                    </span>
                  </div>

                  {currentMatch ? (
                    <div
                      style={{
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid #22c55e",
                        color: "#22c55e",
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#22c55e",
                          display: "inline-block",
                        }}
                      />
                      EN JUEGO
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#9ca3af",
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                      }}
                    >
                      LIBRE AHORA
                    </div>
                  )}
                </div>

                {/* TURNO EN JUEGO */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: 14,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
                    Partido en Curso
                  </div>

                  {currentMatch ? (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>
                        {currentMatch.playerName}
                      </div>
                      <div style={{ fontSize: 14, color: "#38bdf8", marginTop: 4 }}>
                        {currentMatch.startTime} a {currentMatch.endTime} hs ({currentMatch.playersCount || 4} jugadores)
                      </div>

                      {/* TIMER REGRESIVO */}
                      <div
                        style={{
                          marginTop: 16,
                          padding: "12px 16px",
                          background: remainingMinutes <= 10 ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.1)",
                          border: `1px solid ${remainingMinutes <= 10 ? "#ef4444" : "#22c55e"}`,
                          borderRadius: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#d1d5db" }}>
                          Tiempo restante en pista:
                        </span>
                        <strong
                          style={{
                            fontSize: 22,
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            color: remainingMinutes <= 10 ? "#ef4444" : "#22c55e",
                          }}
                        >
                          ⏳ {remainingMinutes} min
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 15, color: "#6b7280", marginTop: 8, fontStyle: "italic" }}>
                      No hay partido disputándose en este momento.
                    </div>
                  )}
                </div>
              </div>

              {/* PRÓXIMO TURNO */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>
                    Próximo Turno
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                    {nextMatch ? nextMatch.playerName : "Sin reserva siguiente"}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    color: "#e8722a",
                  }}
                >
                  {nextMatch ? `${nextMatch.startTime} hs` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
