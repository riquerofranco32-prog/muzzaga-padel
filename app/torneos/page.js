import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BottomNav from "../../components/BottomNav";
import TorneosGallery from "../../components/TorneosGallery";
import TournamentBracket from "../../components/TournamentBracket";
import { CLUB_INFO } from "../../data/club";

export const metadata = {
  title: "Torneos de pádel en Catriel · Muzzaga Pádel",
  description:
    "Torneos de pádel oficiales en Catriel, Río Negro: cuadros, categorías Damas y Caballeros, fotos de ganadores e inscripciones para la próxima fecha.",
};

export default function TorneosPage() {
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
            <span style={{ color: "var(--text-primary)" }}>Torneos Oficiales</span>
          </div>
        </div>

        {/* PRÓXIMO TORNEO DESTACADO */}
        <div className="container" style={{ marginBottom: 20 }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(232, 114, 42, 0.08) 0%, rgba(255, 255, 255, 0.8) 100%)",
              border: "1px solid var(--color-hairline-strong)",
              borderRadius: "var(--radius-xl)",
              padding: "28px 24px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div>
              <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
                Próxima Edición · Cupos Limitados
              </span>
              <h2 style={{ fontSize: 22, color: "var(--color-ink)", margin: "4px 0 8px" }}>
                Torneo Primavera 2026 en Muzzaga
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, maxWidth: 500 }}>
                Categorías 7ma, 6ta y Suma 12. Fase de grupos + cuadro eliminatorio, trofeos y premios en efectivo para campeones.
              </p>
            </div>
            <a
              href={`https://wa.me/${CLUB_INFO.phoneRaw}?text=${encodeURIComponent("¡Hola Muzzaga! Quiero información e inscribirme para el próximo torneo de pádel.")}`}
              target="_blank"
              rel="noopener"
              className="btn btn-linear-primary"
              style={{ padding: "10px 22px" }}
            >
              Consultar Inscripción por WhatsApp →
            </a>
          </div>

          {/* CUADROS Y LLAVES EN VIVO */}
          <TournamentBracket />
        </div>

        <TorneosGallery />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
