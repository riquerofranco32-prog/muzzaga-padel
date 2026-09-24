"use client";

import { useEffect } from "react";

const TARGET_SELECTOR =
    ".section-header-row, .photo-bento-card, .open-card, .rating-box, .map-frame-wrap, .info-card, .info-link-card, .faq-card, .testimonial-card, .club-tool-card, .torneo-thumb, .spec-panel, .fc-wrap, .price-tag";

/** Renders nothing; just wires up the fade-in-on-scroll behavior for the static sections. */
export default function ScrollReveal() {
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
      return;
    if (!("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll(TARGET_SELECTOR);
    targets.forEach((el) => {
      el.classList.add("reveal-up");
      // Índice entre hermanos revelables → escalonado vía CSS (--i).
      const siblings = [...el.parentElement.children].filter((c) =>
        c.matches(TARGET_SELECTOR),
      );
      el.style.setProperty("--i", Math.min(siblings.indexOf(el), 6));
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
