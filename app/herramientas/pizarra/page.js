import Link from "next/link";
import Image from "next/image";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import BottomNav from "../../../components/BottomNav";
import TacticalCourtSimulator from "../../../components/TacticalCourtSimulator";

export const metadata = {
  title: "Pizarra táctica de pádel interactiva · Muzzaga Pádel",
  description:
    "Simulador interactivo de jugadas y táctica de pádel en cancha de cristal: víbora a la reja, smash por 3, bandeja y chiquita animadas paso a paso.",
};

export default function PizarraPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 90, minHeight: "80vh" }}>
        <div className="container" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <Link href="/" style={{ color: "var(--color-accent-orange)", textDecoration: "none", fontWeight: 600 }}>
              ← Volver al Inicio
            </Link>
            <span>/</span>
            <span>Herramientas</span>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>Pizarra Táctica</span>
          </div>
        </div>

        <TacticalCourtSimulator />

        <div className="container" style={{ margin: "40px auto 60px", textAlign: "center" }}>
          <div
            style={{
              background: "var(--color-surface-card)",
              border: "1px solid var(--color-hairline-strong)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 24px",
              maxWidth: 600,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              src="/img/mascotas/muzzaguito-enredado-paleta.webp"
              alt="Muzzaguito enredado con la paleta"
              width={180}
              height={180}
              className="mascot-hero-animated"
              style={{
                width: "clamp(135px, 22vw, 180px)",
                height: "auto",
                objectFit: "contain",
                marginBottom: 16,
                filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.22))",
              }}
            />
            <h3 style={{ fontSize: 20, color: "var(--color-ink)", marginBottom: 8 }}>
              Llevá la táctica a la pista
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, maxWidth: 440 }}>
              Reservá turno en nuestras canchas de cristal y poné a prueba estas jugadas en tu próximo partido.
            </p>
            <Link href="/#turnos" className="btn btn-linear-primary" style={{ padding: "10px 24px" }}>
              Reservar Horario en Muzzaga →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
