import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin panel and its API surface have no reason to be indexed —
        // matches the noindex already set on the /admin layout's own
        // metadata, just enforced at the crawler level too.
        disallow: ["/admin", "/api"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
