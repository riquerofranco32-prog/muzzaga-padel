"use client";

import { useState } from "react";
import Image from "next/image";
import { FAQS } from "../data/faq";

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
            <span
              className="badge-linear badge-indigo"
              style={{ marginBottom: 8 }}
            >
              Dudas habituales
            </span>
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-desc">
              Todo lo que necesitás saber antes de venir a jugar a Muzzaga
              Pádel.
            </p>
          </div>
          <div className="header-aside">
            <div className="mascot-section-badge">
              <Image
                src="/img/mascotas/muzzaguito-guino-paleta-pulgar.webp"
                alt="Muzzaguito respondiendo preguntas frecuentes"
                width={649}
                height={720}
                sizes="(max-width: 768px) 128px, 230px"
                className="mascot-section-img"
              />
            </div>
            <a
              href="https://wa.me/5492995974176?text=Hola%20Muzzaga!%20Tengo%20una%20consulta."
              target="_blank"
              rel="noopener"
              className="btn btn-secondary-whatsapp"
              style={{ gap: 8 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.127-.072-.27-.087-.621-.21-1.077-.407-1.927-.834-3.176-2.778-3.272-2.906-.096-.129-.778-1.037-.778-1.977 0-.94.492-1.401.667-1.593.175-.192.38-.24.507-.24.127 0 .254.002.365.007.119.006.279-.045.437.334.162.388.555 1.353.603 1.451.048.098.08.213.016.341-.064.128-.096.208-.192.32-.096.112-.202.25-.288.336-.096.096-.197.201-.085.393.112.192.497.82 1.066 1.328.733.654 1.352.857 1.544.953.192.096.304.08.416-.048.112-.128.48-1.558.608-.752.128-.192.256-.16.432-.096.176.064 1.114.525 1.306.621.192.096.32.144.368.224.048.08.048.464-.096.869z" />
              </svg>
              Hacer otra pregunta por WhatsApp →
            </a>
          </div>
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
                <div className={`faq-answer-wrap${isOpen ? " open" : ""}`}>
                  <div className="faq-answer-content">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
