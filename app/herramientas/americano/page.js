import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import BottomNav from "../../../components/BottomNav";
import AmericanoGenerator from "../../../components/AmericanoGenerator";

export const metadata = {
  title: "Generador de torneo americano de pádel · Muzzaga Pádel",
  description:
    "Armá el fixture de tu torneo americano de pádel en segundos para grupos de 4 a 8 jugadores. Rotaciones balanceadas y copia directa a WhatsApp.",
};

export default function AmericanoPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 90, minHeight: "80vh" }}>
        <div className="container" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <Link className="back-link" href="/" style={{ color: "var(--color-accent-orange)", textDecoration: "none", fontWeight: 600 }}>
              ← Volver al Inicio
            </Link>
            <span>/</span>
            <span>Herramientas</span>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>Torneo Americano</span>
          </div>
        </div>

        <AmericanoGenerator />

        <div className="container" style={{ margin: "40px auto 60px", textAlign: "center" }}>
          <div
            style={{
              background: "var(--color-surface-card)",
              border: "1px solid var(--color-hairline-strong)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 24px",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <h3 style={{ fontSize: 20, color: "var(--color-ink)", marginBottom: 8 }}>
              ¿Organizan un americano en Muzzaga?
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              Reservá turnos consecutivos para jugar el torneo con tus amigos y disfrutar del mejor tercer tiempo en la cantina.
            </p>
            <Link href="/#turnos" className="btn btn-linear-primary" style={{ padding: "10px 24px" }}>
              Reservar Horarios →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
