// Definición unificada de categorías argentinas y escala de rating
export const PADEL_LEVELS = [
  {
    id: "7ma",
    name: "7ma Categoría",
    shortName: "7ma",
    badge: "badge-emerald",
    ratingRange: "1.5 - 2.9",
    minRating: 1.5,
    maxRating: 2.9,
    label: "7MA CATEGORÍA · Iniciación (1.5 - 2.9)",
    tag: "Iniciación",
    desc: "Golpes de fondo, aprendiendo rebote en paredes y saque seguro. Los partidos abiertos de 7ma son ideales para afianzar ritmo.",
  },
  {
    id: "6ta",
    name: "6ta Categoría",
    shortName: "6ta",
    badge: "badge-amber",
    ratingRange: "3.0 - 3.9",
    minRating: 3.0,
    maxRating: 3.9,
    label: "6TA CATEGORÍA · Intermedio (3.0 - 3.9)",
    tag: "Intermedio",
    desc: "Voleas consistentes, manejo de bandeja y salida de pared firme. Tu nivel te permite competir en torneos de 6ta y partidos parejos todas las semanas.",
  },
  {
    id: "5ta",
    name: "5ta / Libre",
    shortName: "5ta / Libre",
    badge: "badge-indigo",
    ratingRange: "4.0 - 5.5+",
    minRating: 4.0,
    maxRating: 5.5,
    label: "5TA / CATEGORÍA LIBRE · Avanzado (4.0 - 5.5+)",
    tag: "Avanzado",
    desc: "Juego táctico veloz, variantes agresivas en la red y remate con salida por 3. Nivel competitivo para torneos y desafíos intensos.",
  },
];

export function getCategoryForRating(val) {
  const num = Number(val);
  if (num < 3.0) return PADEL_LEVELS[0]; // 7ma
  if (num >= 4.0) return PADEL_LEVELS[2]; // 5ta
  return PADEL_LEVELS[1]; // 6ta
}
