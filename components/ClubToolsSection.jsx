import Link from "next/link";

const TOOLS = [
  {
    href: "/herramientas/dividir-gastos",
    badge: "Para Grupos",
    badgeColor: "badge-emerald",
    icon: "💰",
    title: "Dividir Cancha & 3er Tiempo",
    desc: "Calculá en segundos cuánto paga cada uno por el turno y los consumos de cantina. Copiá el desglose directo al grupo de WhatsApp.",
    cta: "Abrir Calculadora",
  },
  {
    href: "/herramientas/nivel",
    badge: "Competencia",
    badgeColor: "badge-indigo",
    icon: "🎯",
    title: "Test de Nivel & Categorías",
    desc: "Descubrí si sos 7ma, 6ta o 5ta según tu juego y la escala internacional (1.0 a 7.0). Ideal para anotarte en partidos parejos.",
    cta: "Calcular mi Nivel",
  },
  {
    href: "/herramientas/pizarra",
    badge: "Estrategia",
    badgeColor: "badge-amber",
    icon: "📋",
    title: "Pizarra Táctica Interactiva",
    desc: "Simulador interactivo de jugadas en cancha de cristal: repasá paso a paso la víbora a la reja, el smash por 3, bandejas y chiquitas.",
    cta: "Ver Simulador Táctico",
  },
  {
    href: "/herramientas/americano",
    badge: "Torneos Express",
    badgeColor: "badge-emerald",
    icon: "⚡",
    title: "Generador de Torneo Americano",
    desc: "Armá el fixture de rotación para 4 a 8 jugadores donde todos juegan con todos en partidos cortos y equilibrados.",
    cta: "Generar Fixture",
  },
];

export default function ClubToolsSection() {
  return (
    <section
      id="herramientas"
      className="section-turnos"
      style={{ background: "var(--bg-surface)" }}
    >
      <div className="container">
        <div className="section-header-row">
          <div>
            <span
              className="badge-linear badge-amber"
              style={{ marginBottom: 8 }}
            >
              Herramientas Gratuitas
            </span>
            <h2 className="section-title">
              Utilidades para Jugadores del Club
            </h2>
            <p className="section-desc">
              Herramientas interactivas creadas para ayudarte a organizar tus
              partidos, mejorar tu táctica y saber tu categoría.
            </p>
          </div>
        </div>

        <div className="tools-grid">
          {TOOLS.map((tool) => (
            <div key={tool.href} className="club-tool-card">
              <div>
                <div className="club-tool-top">
                  <span className="club-tool-icon" aria-hidden="true">
                    {tool.icon}
                  </span>
                  <span className={`badge-linear ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>
                <h3 className="club-tool-title">{tool.title}</h3>
                <p className="club-tool-desc">{tool.desc}</p>
              </div>

              <Link href={tool.href} className="club-tool-link">
                {tool.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
