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
    alt: "Café de especialidad y porción de torta en la cantina de Muzzaga",
    label: "Café & Torta",
    caption: "Cantina · Café y Algo Dulce con Vista a la Pista",
  },
  {
    src: "/img/cantina_beer_court.jpg",
    alt: "Cantina Muzzaga con vista a las canchas",
    label: "Cantina & 3er Tiempo",
    caption: "Cantina Muzzaga · Cerveza Helada y Vista a las Canchas",
  },
  {
    src: "/img/court_arena_wide.jpg",
    alt: "Cartel de entrada de Muzzaga Pádel",
    label: "Entrada del Club",
    caption: "Cartel Iluminado en la Entrada del Club",
  },
  {
    src: "/img/bar_coffee_snacks.jpg",
    alt: "Empanadas y pantalla en la cantina de Muzzaga",
    label: "Empanadas & Pantalla",
    caption: "Cantina · Empanadas y Pantalla para el Tercer Tiempo",
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
    caption: "Pasillo de Canchas de Cristal",
  },
  {
    src: "/img/court_bench_players.jpg",
    alt: "Zona de bancos y jugadores en pista de cristal",
    label: "Cancha de Cristal",
    caption: "Cancha de Cristal con Iluminación LED",
  },
  {
    src: "/img/panoramic_courts.jpg",
    alt: "Espectadores mirando un partido en Muzzaga",
    label: "Bancos de Pista",
    caption: "Siguiendo el Partido desde los Bancos de Pista",
  },
];

export default function HeroMarquee() {
  return (
    <div
      className="marquee-container"
      aria-label="Fotos reales de Muzzaga Pádel"
    >
      <div className="marquee-track">
        {PHOTOS.map((photo, i) => (
          <MarqueeCard key={photo.src} {...photo} priority={i < 4} />
        ))}
        {PHOTOS.map((photo) => (
          <MarqueeCard key={`${photo.src}-dup`} {...photo} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
