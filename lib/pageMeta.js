// Metadatos de cada página pública: título, descripción, canónico y la
// tarjeta para compartir con los mismos textos. Next mezcla `openGraph` de
// forma superficial: si la página no lo define, hereda el de la home y el
// link de una herramienta se comparte hablando de las canchas.
const OG_BASE = { type: "website", siteName: "Muzzaga Pádel", locale: "es_AR" };

// La tarjeta de app/opengraph-image.js: al definir openGraph, la página deja
// de heredarla, así que va explícita.
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Muzzaga Pádel · Canchas de pádel en Catriel",
};

/**
 * @param {{ title: string, description: string, path: string }} page
 */
export function pageMetadata({ title, description, path }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_BASE, title, description, url: path, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
