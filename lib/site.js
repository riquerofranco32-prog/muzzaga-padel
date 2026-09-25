// Dominio público del sitio: una sola fuente para metadatos, canónicos,
// robots, sitemap, JSON-LD, links para compartir y retornos de pago.
//
// Antes convivían muzzagapadel.com.ar (metadataBase, JSON-LD, Mercado Pago),
// que todavía no resuelve, y la URL de Vercel (robots, sitemap, links para
// compartir). Por eso la vista previa de WhatsApp salía sin imagen: og:image
// apuntaba al dominio que no existe. Cuando el club conecte su dominio, se
// define NEXT_PUBLIC_SITE_URL y cambia todo junto.
//
// Solo variables NEXT_PUBLIC_: los links para compartir se arman en el
// navegador, y ahí las demás llegan vacías. Vercel expone sola la versión
// NEXT_PUBLIC_ del dominio de producción.
const production =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || (production ? `https://${production}` : null);

export const SITE_URL = (fromEnv || "https://muzzaga-padel-seven.vercel.app").replace(/\/+$/, "");
