import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Muzzaga Pádel - Canchas de Pádel en Catriel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141413",
          backgroundImage:
            "radial-gradient(circle at 50% 35%, #e8722a 0%, #141413 75%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 60,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#e8722a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 3,
            }}
          >
            MUZZAGA PÁDEL
          </span>
        </div>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Canchas de Pádel en Catriel
        </h1>
        <p
          style={{
            fontSize: 24,
            color: "#e2e8f0",
            marginTop: 20,
            maxWidth: 820,
          }}
        >
          2 Canchas Profesionales de Cristal · Iluminación LED · Torneos · Cantina
        </p>
        <div
          style={{
            marginTop: 36,
            backgroundColor: "#e8722a",
            color: "#ffffff",
            padding: "14px 34px",
            borderRadius: 32,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Reservá tu Turno Online · Catriel, Río Negro
        </div>
      </div>
    ),
    { ...size }
  );
}
