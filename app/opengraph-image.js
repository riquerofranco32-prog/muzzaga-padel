import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

// Tarjeta para compartir el link (WhatsApp, redes): el logo real, la
// mascota de lentes (la del hero) y las tipografías de la marca. Antes era
// una "M" en un círculo, fuente del sistema y todo en mayúsculas.

export const runtime = "nodejs";
export const alt = "Muzzaga Pádel · Canchas de pádel en Catriel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITLE = "Canchas de pádel en Catriel";
const SUB = "Dos canchas de cristal · Turnos de 90 min";
const FOOT = "Catriel, Río Negro";

// Google Fonts devuelve TTF cuando no se pide woff2; `text` recorta la
// fuente a los caracteres que se usan. Si falla la red, queda la fuente
// por defecto de next/og y la imagen se genera igual.
async function googleFont(family, weight, text) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

const asset = async (name) =>
  `data:image/png;base64,${(await readFile(join(process.cwd(), "assets/og", name))).toString("base64")}`;

export default async function Image() {
  const [logo, mascota, display, sansSemi, sansBold] = await Promise.all([
    asset("logo-blanco.png"),
    asset("mascota-lentes-paleta.png"),
    googleFont("Barlow+Condensed", 800, TITLE.toUpperCase()),
    googleFont("Poppins", 500, SUB + FOOT),
    googleFont("Poppins", 700, "Reservá tu turno online"),
  ]);

  const fonts = [
    display && { name: "Barlow Condensed", data: display, weight: 800, style: "normal" },
    sansSemi && { name: "Poppins", data: sansSemi, weight: 500, style: "normal" },
    sansBold && { name: "Poppins", data: sansBold, weight: 700, style: "normal" },
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#1b1b19",
          backgroundImage:
            "radial-gradient(circle at 82% 58%, rgba(232, 114, 42, 0.38) 0%, rgba(27, 27, 25, 0) 55%)",
          color: "#ffffff",
          fontFamily: "Poppins",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 0 60px 72px",
            width: 712,
          }}
        >
          <img src={logo} width={260} height={134} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 800,
                fontSize: 92,
                lineHeight: 0.92,
                textTransform: "uppercase",
                letterSpacing: -0.5,
              }}
            >
              {TITLE.toUpperCase()}
            </div>
            <div style={{ marginTop: 22, fontSize: 27, fontWeight: 500, color: "rgba(255,255,255,0.86)" }}>
              {SUB}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                padding: "12px 26px",
                borderRadius: 999,
                backgroundColor: "#e8722a",
                fontSize: 24,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Reservá tu turno online
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{FOOT}</div>
          </div>
        </div>

        <img
          src={mascota}
          width={470}
          height={437}
          alt=""
          style={{ position: "absolute", right: 24, bottom: 56 }}
        />
      </div>
    ),
    { ...size, fonts }
  );
}
