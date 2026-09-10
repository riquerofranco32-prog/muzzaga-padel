export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Martín R.",
      role: "6ta Categoría · Jugador Habitual",
      content: "Las canchas de cristal de Muzzaga son las mejores de la zona. El pique es parejo, no te resbalás nunca y la luz LED de noche no te encandila en los globos.",
      tag: "Canchas Pro",
      stars: 5,
    },
    {
      name: "Valeria G.",
      role: "Torneo Damas · Catriel",
      content: "Excelente organización en los torneos y la cantina es un 10. Después de jugar nos quedamos comiendo las pizzas y tomando una cerveza helada mirando los otros partidos.",
      tag: "Ambiente & Cantina",
      stars: 5,
    },
    {
      name: "Lucas P.",
      role: "Canchas Abiertas · 7ma",
      content: "Me mudé hace poco a Catriel y gracias a las Canchas Abiertas me armaron partidos al toque con gente de mi nivel. Gran comunidad de pádel.",
      tag: "Comunidad",
      stars: 5,
    },
  ];

  return (
    <section id="comunidad" className="section-turnos" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-amber" style={{ marginBottom: 8 }}>
              Comunidad Catriel
            </span>
            <h2 className="section-title">Lo que dicen quienes juegan en Muzzaga</h2>
            <p className="section-desc">
              Más de 200 jugadores eligen nuestras canchas todas las semanas.
            </p>
          </div>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars" aria-label={`${t.stars} estrellas`}>
                {"★".repeat(t.stars)}
              </div>
              <p className="testimonial-quote">"{t.content}"</p>
              <div className="testimonial-author-row">
                <div className="testimonial-avatar">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <strong className="testimonial-name">{t.name}</strong>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
