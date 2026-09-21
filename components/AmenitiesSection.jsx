export default function AmenitiesSection() {
  const amenities = [
    {
      title: "2 Canchas de Cristal",
      desc: "Dos canchas de cristal preparadas para juego diurno y nocturno con rebote homogéneo.",
      tag: "Canchas",
      colorBadge: "badge-emerald",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      title: "Iluminación LED",
      desc: "Iluminación LED en todas las canchas para jugar de noche con excelente visibilidad.",
      tag: "Visibilidad",
      colorBadge: "badge-amber",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      title: "Cantina Propia",
      desc: "Espacio gastronómico para el tercer tiempo con pizzas caseras, minutas y bebidas.",
      tag: "Tercer Tiempo",
      colorBadge: "badge-indigo",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      title: "Alquiler de Paletas",
      desc: "Alquiler de paletas y pelotas en el club para que juegues aunque no tengas tu propio equipo.",
      tag: "Equipamiento",
      colorBadge: "badge-emerald",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="9" rx="7" ry="7.5" />
          <path d="M10 16.5v4.5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4.5" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
          <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <section id="instalaciones" className="section-bento">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-emerald" style={{ marginBottom: 8 }}>
              Instalaciones Profesionales
            </span>
            <h2 className="section-title">Todo lo que necesitás para jugar al mejor nivel</h2>
            <p className="section-desc">
              Diseñado de cero para brindar la mejor experiencia deportiva y social de Catriel.
            </p>
          </div>
        </div>

        <div className="amenities-grid">
          {amenities.map((item, i) => (
            <div key={i} className="amenity-card">
              <div className="amenity-top-row">
                <div className="amenity-icon-wrapper">{item.icon}</div>
                <span className={`badge-linear ${item.colorBadge}`}>{item.tag}</span>
              </div>
              <h3 className="amenity-title">{item.title}</h3>
              <p className="amenity-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
