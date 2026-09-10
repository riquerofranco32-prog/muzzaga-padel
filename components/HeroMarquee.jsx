import { MarqueeCard } from "./PhotoCard";

const PHOTOS = [
  {
    src: "/img/court_blue_glass.jpg",
    alt: "Cantina de Muzzaga con pantalla para ver partidos",
    label: "Pantalla & Cantina",
    caption: "Cantina · Pantalla Gigante para ver los Partidos",
  },
  {
    src: "/img/match_action_led.jpg",
    alt: "Partido de noche con luces LED en Muzzaga",
    label: "Juego Nocturno · LED",
    caption: "Juego Nocturno · Iluminación LED Nocturna",
  },
  {
    src: "/img/cantina_beer_court.jpg",
    alt: "Cantina Muzzaga con vista a las canchas",
    label: "Cantina & 3er Tiempo",
    caption: "Cantina Muzzaga · Cerveza Tirada y Vista a las Canchas",
  },
  {
    src: "/img/court_arena_wide.jpg",
    alt: "Cartel de entrada de Muzzaga Pádel",
    label: "Entrada del Club",
    caption: "Entrada del Club Muzzaga",
  },
  {
    src: "/img/bar_coffee_snacks.jpg",
    alt: "Empanadas y pantalla en la cantina de Muzzaga",
    label: "Empanadas & Pantalla",
    caption: "Empanadas y Pantalla para el Tercer Tiempo",
  },
  {
    src: "/img/court_spectators.jpg",
    alt: "Espectadores mirando un partido en Muzzaga Pádel",
    label: "Público en Cancha",
    caption: "Público Mirando el Partido desde los Bancos",
  },
  {
    src: "/img/lounge_tv_table.jpg",
    alt: "Pasillo junto a las canchas de Muzzaga",
    label: "Pasillo de Canchas",
    caption: "Pasillo de Canchas",
  },
  {
    src: "/img/court_bench_players.jpg",
    alt: "Zona de bancos de jugadores en pista",
    label: "Bancos de Pista",
    caption: "Zona de Jugadores y Bancos de Pista",
  },
  {
    src: "/img/panoramic_courts.jpg",
    alt: "Espectadores mirando un partido en Muzzaga",
    label: "Mirando el Partido",
    caption: "Mirando el Partido desde Adentro",
  },
];

export default function HeroMarquee() {
  // Duplicated once so the CSS marquee animation (-50%) loops seamlessly.
  const loop = [...PHOTOS, ...PHOTOS];
  return (
    <div
      className="marquee-container"
      aria-label="Fotos reales de Muzzaga Pádel"
    >
      <div className="marquee-track">
        {loop.map((photo, i) => (
          <MarqueeCard
            key={`${photo.src}-${i}`}
            {...photo}
            priority={i < PHOTOS.length}
          />
        ))}
      </div>
    </div>
  );
}
