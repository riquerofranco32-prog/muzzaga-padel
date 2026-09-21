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
    icon: "/img/logo_badge.png",
    apple: "/img/logo_badge.png",
  },
  openGraph: {
    type: "website",
    siteName: "Muzzaga Pádel",
    title: "Muzzaga Pádel · Reservá tu Cancha en Catriel",
    description:
      "2 canchas de cristal profesionales, iluminación LED, torneos y cantina propia para el tercer tiempo en Catriel.",
    images: ["/img/logo_full.png"],
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
  themeColor: "#ffffff",
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
