import { Poppins, JetBrains_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import LightboxProvider from "../components/LightboxProvider";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// --font-mono apuntaba a Poppins (no es monoespaciada): los precios de la
// grilla de turnos/admin y los códigos de reserva (<code>) usan esa variable
// esperando dígitos alineados tipo ticket, y con una tipografía proporcional
// nunca lo consiguen.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Display condensada para titulares de la landing (tono de marcador deportivo).
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://muzzagapadel.com.ar",
  ),
  title:
    "Canchas de Pádel en Catriel · Muzzaga Pádel · Reservá tu Cancha Online",
  description:
    "Club de pádel en Catriel, Río Negro. 2 canchas profesionales de cristal, iluminación LED, turnos de 90 min, Canchas Abiertas comunitarias y cantina.",
  icons: {
    icon: "/img/logo_badge.png",
    apple: "/img/logo_badge.png",
  },
  openGraph: {
    type: "website",
    siteName: "Muzzaga Pádel",
    title: "Canchas de Pádel en Catriel · Muzzaga Pádel",
    description:
      "2 canchas oficiales de cristal, iluminación LED, torneos y cantina propia para el mejor tercer tiempo en Catriel.",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canchas de Pádel en Catriel · Muzzaga Pádel",
    description:
      "2 canchas oficiales de cristal, iluminación LED, torneos y cantina propia para el mejor tercer tiempo en Catriel.",
  },
};

export const viewport = {
  themeColor: "#e8722a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Muzzaga Pádel",
  description:
    "Club de pádel en Catriel, Río Negro. 2 canchas profesionales de cristal, iluminación LED, torneos todo el año y cantina propia.",
  url: "https://muzzagapadel.com.ar",
  telephone: "+5492995974176",
  priceRange: "$$",
  hasMap: "https://maps.google.com/maps?q=-37.8832905,-67.8005469",
  image: [
    "https://muzzagapadel.com.ar/img/court_glass_night_match.jpg",
    "https://muzzagapadel.com.ar/img/panoramic_courts.jpg",
    "https://muzzagapadel.com.ar/img/logo_full.png",
  ],
  geo: {
    "@type": "GeoCoordinates",
    latitude: -37.8832905,
    longitude: -67.8005469,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "14:00",
      closes: "00:30",
    },
  ],
  sameAs: ["https://instagram.com/muzzagapadel"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Cacique Catriel y Córdoba",
    addressLocality: "Catriel",
    addressRegion: "Río Negro",
    postalCode: "R8307",
    addressCountry: "AR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${poppins.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LightboxProvider>{children}</LightboxProvider>
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
