import Link from "next/link";

const TOOLS = [
  {
    href: "/herramientas/dividir-gastos",
    badge: "Para Grupos",
    badgeColor: "badge-emerald",
    icon: "💰",
    title: "Dividir Cancha & 3er Tiempo",
    desc: "Calculá en segundos cuánto paga cada uno por el turno y los consumos de cantina. Copiá el desglose directo al grupo de WhatsApp.",
    cta: "Abrir Calculadora →",
  },
  {
    href: "/herramientas/nivel",
    badge: "Competencia",
    badgeColor: "badge-indigo",
    icon: "🎯",
    title: "Test de Nivel & Categorías",
    desc: "Descubrí si sos 7ma, 6ta o 5ta según tu juego y la escala internacional (1.0 a 7.0). Ideal para anotarte en partidos parejos.",
    cta: "Calcular mi Nivel →",
  },
  {
    href: "/herramientas/pizarra",
    badge: "Estrategia",
    badgeColor: "badge-amber",
    icon: "📋",
    title: "Pizarra Táctica Interactiva",
    desc: "Simulador interactivo de jugadas en cancha de cristal: repasá paso a paso la víbora a la reja, el smash por 3, bandejas y chiquitas.",
    cta: "Ver Simulador Táctico →",
  },
  {
    href: "/herramientas/americano",
    badge: "Torneos Express",
    badgeColor: "badge-emerald",
    icon: "⚡",
    title: "Generador de Torneo Americano",
    desc: "Armá el fixture de rotación para 4 a 8 jugadores donde todos juegan con todos en partidos cortos y equilibrados.",
    cta: "Generar Fixture →",
  },
];

export default function ClubToolsSection() {
  return (
    <section id="herramientas" className="section-turnos" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Herramientas Gratuitas
            </span>
            <h2 className="section-title">Utilidades para Jugadores del Club</h2>
            <p className="section-desc">
              Herramientas interactivas creadas para ayudarte a organizar tus partidos, mejorar tu táctica y saber tu categoría.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(270px, 100%), 1fr))",
            gap: 20,
            marginTop: 10,
          }}
        >
          {TOOLS.map((tool) => (
            <div
              key={tool.href}
              style={{
                background: "var(--color-surface-card)",
                border: "1px solid var(--color-hairline-strong)",
                borderRadius: "var(--radius-xl)",
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              className="club-tool-card"
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{tool.icon}</span>
                  <span className={`badge-linear ${tool.badgeColor}`} style={{ fontSize: 11 }}>
                    {tool.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, color: "var(--color-ink)", margin: "0 0 8px", fontWeight: 700 }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: 13.5, color: "var(--color-body)", lineHeight: 1.5, margin: 0 }}>
                  {tool.desc}
                </p>
              </div>

              <Link
                href={tool.href}
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 14px",
                }}
              >
                {tool.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
