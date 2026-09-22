export default function manifest() {
  return {
    name: "Muzzaga Pádel Catriel",
    short_name: "Muzzaga Pádel",
    description: "Club de pádel en Catriel, Río Negro. Reservas de canchas, torneos y cantina.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e8722a",
    icons: [
      {
        src: "/img/logo_badge.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/img/logo_full.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
