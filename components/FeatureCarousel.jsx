"use client";

// Adaptado de un componente shadcn/Tailwind/TS (motion + hugeicons) al stack
// real del proyecto: JS + CSS plano en globals.css, sin Tailwind ni TS. Los
// íconos son los mismos SVG inline que ya usa AmenitiesSection, y las fotos
// son las reales del club (public/img), no placeholders de stock.

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconCourt() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function IconBulb() {
  return (
    <svg {...ICON_PROPS}>
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
  );
}

function IconCantina() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3a2 2 0 0 1-2 4h-1M7 5H4a2 2 0 0 0 2 4h1" />
    </svg>
  );
}

function IconSofa() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
      <path d="M2 12h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4Z" />
      <line x1="4" y1="18" x2="4" y2="21" />
      <line x1="20" y1="18" x2="20" y2="21" />
    </svg>
  );
}

// Mapeo verificado mirando cada foto real (los nombres de archivo venían de
// otra sesión y no coinciden con el contenido: court_blue_glass.jpg es en
// realidad la mesa del living viendo TV, match_action_led.jpg es un café con
// la cancha de fondo, etc). No hay foto real de "alquiler de paletas": se
// sacó esa feature en vez de ilustrarla con una imagen que no la muestra.
const FEATURES = [
  {
    id: "canchas",
    label: "Canchas de Cristal",
    icon: IconCourt,
    image: "/img/court_bench_players.jpg",
    description: "2 canchas de cristal profesionales con rebote homogéneo.",
  },
  {
    id: "led",
    label: "Iluminación LED",
    icon: IconBulb,
    image: "/img/lounge_tv_table.jpg",
    description:
      "Luz LED en todas las canchas para jugar de noche sin perder nitidez.",
  },
  {
    id: "cantina",
    label: "Cantina Propia",
    icon: IconCantina,
    image: "/img/cantina_beer_court.jpg",
    description: "Pizzas caseras, minutas y bebidas para el tercer tiempo.",
  },
  {
    id: "comunidad",
    label: "Canchas Abiertas",
    icon: IconUsers,
    image: "/img/court_spectators.jpg",
    description: "Partidos comunitarios para sumarte aunque vengas solo.",
  },
  {
    id: "torneos",
    label: "Torneos Todo el Año",
    icon: IconTrophy,
    image: "/img/panoramic_courts.jpg",
    description: "Torneos y ligas internas durante toda la temporada.",
  },
  {
    id: "living",
    label: "Living y Tercer Tiempo",
    icon: IconSofa,
    image: "/img/bar_coffee_snacks.jpg",
    description:
      "Pantalla grande, mesas y buena previa para quedarte después de jugar.",
  },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 52;

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export default function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);

  const handleChipClick = (index) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;
    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;
    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="fc-wrap">
      <div className="fc-frame">
        <div className="fc-nav">
          <div className="fc-nav-fade fc-nav-fade-top" />
          <div className="fc-nav-fade fc-nav-fade-bottom" />
          <div className="fc-nav-track">
            {FEATURES.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance,
              );
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.id}
                  style={{ height: ITEM_HEIGHT }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="fc-nav-item"
                >
                  <button
                    type="button"
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={`fc-pill${isActive ? " active" : ""}`}
                  >
                    <span className="fc-pill-icon">
                      <Icon />
                    </span>
                    <span className="fc-pill-label">{feature.label}</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="fc-stage">
          <div className="fc-stage-card-wrap">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="fc-stage-card"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    className={`fc-stage-img${isActive ? " active" : ""}`}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fc-stage-caption"
                      >
                        <span className="fc-stage-tag">
                          {index + 1} · {feature.label}
                        </span>
                        <p className="fc-stage-desc">{feature.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
