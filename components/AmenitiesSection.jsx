export default function AmenitiesSection() {
  const amenities = [
    {
      title: "2 Canchas de Cristal Oficiales",
      desc: "Vidrio templado de 10mm y césped sintético texturado de alta densidad. Rebote homogéneo y velocidad controlada.",
      tag: "WPT Spec",
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
      title: "Iluminación LED Pro Sin Sombras",
      desc: "8 proyectores LED de 200W por pista calibrados para partidos nocturnos y transmisiones sin deslumbramiento.",
      tag: "100% Visibilidad",
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
      title: "Cantina & 3er Tiempo Climatizado",
      desc: "Pizzas a la piedra, sándwiches de milanesa, canillas de cerveza tirada helada y pantalla para ver partidos.",
      tag: "Social & Club",
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
      title: "Alquiler & Test de Paletas",
      desc: "¿Venís sin equipo? Alquilá paletas de testeo de primeras marcas y tubos de pelotas presurizadas oficiales.",
      tag: "Equipamiento",
      colorBadge: "badge-emerald",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
    },
    {
      title: "Vestuarios con Duchas",
      desc: "Instalaciones cómodas y sanitarios limpios con agua caliente presurizada para cambiarte después del partido.",
      tag: "Comodidad",
      colorBadge: "badge-indigo",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M12 4v16" />
        </svg>
      ),
    },
    {
      title: "Estacionamiento Propio en el Predio",
      desc: "Espacio exclusivo para autos y motos dentro del club con acceso directo a las canchas.",
      tag: "Seguridad",
      colorBadge: "badge-amber",
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
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
