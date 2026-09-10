"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "¿Cómo confirmo mi reserva de turno?",
    a: "Al seleccionar tu horario en el calendario de la web, completás tus datos y se genera tu código de reserva. Luego te redirige a WhatsApp con el mensaje listo para coordinar la seña y dejar el turno 100% confirmado en el sistema.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Aceptamos transferencias bancarias directas, Mercado Pago (alias/CVU) y efectivo en la cantina del club antes de ingresar a la pista.",
  },
  {
    q: "¿Tienen alquiler de paletas y pelotas?",
    a: "¡Sí! Contamos con paletas de testeo de primeras marcas en alquiler para que juegues cómodo aunque no tengas tu pala, y tubos de pelotas nuevas presurizadas a la venta.",
  },
  {
    q: "¿Cómo funcionan las Canchas Abiertas?",
    a: "¿Te falta uno para completar o querés jugar pero no tenés pareja? Publicamos convocatorias por nivel (7ma, 6ta, 5ta) en el grupo de WhatsApp del club. Te sumás, conocés nuevos rivales y jugás partidos parejos.",
  },
  {
    q: "¿Con cuánta anticipación puedo cancelar o reprogramar?",
    a: "Podés avisarnos por WhatsApp hasta con 4 horas de anticipación para reprogramar tu turno sin perder la seña para otro día u horario disponible.",
  },
  {
    q: "¿Tienen escuelita o clases particulares?",
    a: "Sí, contamos con profesores matriculados para clases individuales y grupales de iniciación, técnica de pared, táctica de dobles y entrenamiento físico de pádel.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-turnos">
      <div className="container">
        <div className="section-header-row">
          <div>
            <span className="badge-linear badge-indigo" style={{ marginBottom: 8 }}>
              Dudas habituales
            </span>
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-desc">
              Todo lo que necesitás saber antes de venir a jugar a Muzzaga Pádel.
            </p>
          </div>
          <a
            href="https://wa.me/5492995974176?text=Hola%20Muzzaga!%20Tengo%20una%20consulta."
            target="_blank"
            rel="noopener"
            className="btn btn-secondary"
          >
            Hacer otra pregunta por WhatsApp →
          </a>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`faq-card${isOpen ? " active" : ""}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-content">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
