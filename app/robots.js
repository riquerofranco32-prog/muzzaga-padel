export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: "https://muzzaga-padel-seven.vercel.app/sitemap.xml",
  };
}
