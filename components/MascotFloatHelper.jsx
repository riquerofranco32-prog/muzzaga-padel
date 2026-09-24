"use client";

import { useState } from "react";
import Link from "next/link";
import { CLUB_INFO } from "../data/club";

export default function MascotFloatHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mascot-float">
      {/* POPUP / GREETING CARD */}
      {isOpen && (
        <div
          style={{
            marginBottom: 12,
            background: "#ffffff",
            color: "#18181b",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)",
            maxWidth: 270,
            width: "calc(100vw - 48px)",
            position: "relative",
            animation: "fadeInUp var(--t-estado) var(--ease-mascota)",
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "none",
              border: "none",
              fontSize: 14,
              cursor: "pointer",
              color: "#a1a1aa",
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🎾</span>
            <strong style={{ fontSize: 14, color: "#e8722a" }}>
              ¡Hola, soy Muzzaguito!
            </strong>
          </div>

          <p style={{ fontSize: 12.5, color: "#52525b", margin: "0 0 12px", lineHeight: 1.4 }}>
            ¿Tenés ganas de jugar hoy o necesitás consultar algo sobre las canchas de Catriel?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <a
              href="#turnos"
              onClick={() => setIsOpen(false)}
              className="btn btn-linear-primary"
              style={{
                height: 32,
                fontSize: 12,
                padding: "0 12px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              📅 Ver Turnos Disponibles
            </a>
            <a
              href={`https://wa.me/${CLUB_INFO.phoneRaw}?text=Hola%20Muzzaga!%20Quería%20hacer%20una%20consulta%20sobre%20las%20canchas.`}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              style={{
                height: 32,
                fontSize: 12,
                padding: "0 12px",
                justifyContent: "center",
                textDecoration: "none",
                gap: 6,
              }}
            >
              💬 WhatsApp del Club
            </a>
            <Link
              href="/menu"
              className="btn btn-secondary"
              style={{
                height: 32,
                fontSize: 12,
                padding: "0 12px",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              🍕 Menú de Cantina
            </Link>
          </div>
        </div>
      )}

      {/* FLOATING MASCOT BUTTON */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="pulse-badge-live"
            style={{
              background: "rgba(24, 24, 27, 0.9)",
              backdropFilter: "blur(8px)",
              color: "#ffffff",
              border: "1px solid rgba(232, 114, 42, 0.4)",
              padding: "6px 14px",
              minHeight: 44,
              borderRadius: 22,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>¿Jugamos? 🎾</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "transform var(--t-hover) var(--ease-mascota)",
            position: "relative",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(-4deg)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          title="Mascota oficial de Muzzaga Pádel"
        >
          <img
            src="/img/mascotas/muzzaguito-guino-paleta-pulgar.webp"
            alt="Muzzaguito - Mascota Muzzaga Pádel"
            width={649}
            height={720}
            loading="lazy"
            decoding="async"
            className="mascot-hero-animated"
            style={{
              width: 92,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
              display: "block",
            }}
          />
        </button>
      </div>
    </div>
  );
}
