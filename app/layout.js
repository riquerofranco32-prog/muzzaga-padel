import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LightboxProvider from "../components/LightboxProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://muzzaga-padel.vercel.app"),
  title:
    "Muzzaga Pádel · Reservá tu Cancha, Canchas Abiertas y Torneos en Catriel",
  description:
    "Club de pádel en Catriel, Río Negro. Reservá tu cancha, sumate a Canchas Abiertas comunitarias y descubrí tu nivel de juego.",
  keywords:
    "muzzaga padel, padel catriel, turnos padel catriel, canchas abiertas catriel, rio negro padel",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='9' fill='%2308090a'/%3E%3Ctext x='50%25' y='54%25' font-family='Arial,sans-serif' font-weight='700' font-size='22' fill='%23E8722A' text-anchor='middle' dominant-baseline='middle'%3EM%3C/text%3E%3C/svg%3E",
  },
  openGraph: {
    type: "website",
    siteName: "Muzzaga Pádel",
    title: "Muzzaga Pádel · Reservá tu Cancha en Catriel",
    description:
      "2 canchas de cristal profesionales, iluminación LED, torneos y cantina propia para el tercer tiempo en Catriel.",
    images: ["/img/court_spectators.jpg"],
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muzzaga Pádel · Reservá tu Cancha en Catriel",
    description:
      "2 canchas de cristal profesionales, iluminación LED, torneos y cantina propia para el tercer tiempo en Catriel.",
    images: ["/img/court_spectators.jpg"],
  },
};

export const viewport = {
  themeColor: "#08090a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Muzzaga Pádel",
  description:
    "Club de pádel en Catriel, Río Negro. 2 canchas, torneos todo el año y cantina propia.",
  telephone: "+5492995974176",
  sameAs: ["https://instagram.com/muzzagapadel"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Catriel",
    addressRegion: "Río Negro",
    addressCountry: "AR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LightboxProvider>{children}</LightboxProvider>
      </body>
    </html>
  );
}
