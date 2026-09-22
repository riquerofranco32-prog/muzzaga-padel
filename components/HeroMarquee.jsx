import { MarqueeCard } from "./PhotoCard";

const PHOTOS = [
  {
    src: "/img/court_blue_glass.jpg",
    alt: "Cancha de pádel con cristales templados y césped azul en Muzzaga",
    label: "Cancha de Cristal",
    caption: "Cancha Oficial de Cristal con Césped Azul de Alta Densidad",
  },
  {
    src: "/img/match_action_led.jpg",
    alt: "Jugada de pádel en acción bajo iluminación LED profesional en Muzzaga",
    label: "Pádel Nocturno",
    caption: "Partido de Pádel Nocturno bajo Iluminación LED",
  },
  {
    src: "/img/cantina_beer_court.jpg",
    alt: "Cantina Muzzaga con cerveza helada y vista a las canchas",
    label: "Cantina & 3er Tiempo",
    caption: "Cantina Muzzaga · Cerveza Helada y Vista a las Canchas",
  },
  {
    src: "/img/court_arena_wide.jpg",
    alt: "Vista panorámica de las canchas de pádel del club Muzzaga en Catriel",
    label: "Instalaciones",
    caption: "Instalaciones Profesionales de Muzzaga Pádel",
  },
  {
    src: "/img/bar_coffee_snacks.jpg",
    alt: "Buffet y barra de café con snacks en la cantina de Muzzaga",
    label: "Café & Buffet",
    caption: "Cantina · Café, Bebidas y Minutas para el Partido",
  },
  {
    src: "/img/court_spectators.jpg",
    alt: "Espectadores y público mirando un partido desde las gradas en Muzzaga Pádel",
    label: "Público en Cancha",
    caption: "Público Siguiendo el Partido desde los Bancos de Pista",
  },
  {
    src: "/img/lounge_tv_table.jpg",
    alt: "Sector lounge con pantalla y mesas junto a las canchas de Muzzaga",
    label: "Lounge & Pantalla",
    caption: "Sector Lounge para Compartir el Tercer Tiempo",
  },
  {
    src: "/img/court_bench_players.jpg",
    alt: "Zona de descanso de jugadores junto a la cancha de cristal",
    label: "Bancos de Pista",
    caption: "Zona de Descanso y Preparación de Jugadores",
  },
  {
    src: "/img/panoramic_courts.jpg",
    alt: "Vista panorámica integral de ambas canchas de pádel de Muzzaga",
    label: "2 Canchas Oficiales",
    caption: "Predio con 2 Canchas de Cristal e Iluminación LED",
  },
];

export default function HeroMarquee() {
  return (
    <div
      className="marquee-container"
      aria-label="Fotos reales de Muzzaga Pádel"
    >
      <div className="marquee-track">
        {PHOTOS.map((photo) => (
          <MarqueeCard key={photo.src} {...photo} />
        ))}
        {PHOTOS.map((photo) => (
          <MarqueeCard key={`${photo.src}-dup`} {...photo} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
