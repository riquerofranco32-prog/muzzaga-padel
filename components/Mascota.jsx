import Image from "next/image";

// Muzzaguito · una sola versión (mismo render en todas las poses), tres
// tamaños. XL es la del hero (HeroMascot, la única que reacciona); acá van
// M (encabezados, tarjetas, estados) y S (footer, ayudante). Medidas reales
// de cada archivo para que next/image no deforme ni pida de más.
const POSES = {
  "descanso-mate": [720, 710],
  "enredado-grip": [682, 720],
  "enredado-paleta": [720, 677],
  "golpe-pelota": [720, 600],
  "guino-paleta-pulgar": [649, 720],
  "lentes-paleta": [720, 671],
  "mochila-pulgar": [720, 672],
  "pelota-padel-life": [720, 602],
  "pizza-cerveza": [720, 677],
  "pizza-good-vibes": [720, 612],
  "pizza-padel-mood": [720, 653],
  "trofeo-bolso": [668, 720],
  "trofeo-paleta": [720, 663],
};

// M mide 160 px (120 hasta 900 de ancho); S, 96 px. Ver "MASCOTA · sistema"
// en globals.css.
const SIZES = {
  m: "(max-width: 900px) 120px, 160px",
  s: "96px",
};

/**
 * @param {{ pose: keyof typeof POSES, size?: "m" | "s", alt?: string, className?: string, priority?: boolean }} props
 */
export default function Mascota({ pose, size = "m", alt = "", className = "", priority = false }) {
  const [width, height] = POSES[pose];
  return (
    <Image
      src={`/img/mascotas/muzzaguito-${pose}.webp`}
      alt={alt}
      width={width}
      height={height}
      sizes={SIZES[size]}
      priority={priority}
      className={`mascota mascota-${size}${className ? ` ${className}` : ""}`}
    />
  );
}
