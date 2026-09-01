import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/lib/i18n/config";
import { categoryPath, productPath, MATERIAL_SLUGS, CATALOG_MATERIALS } from "@/lib/materialPaths";
import { MATERIAL_PRODUCT_LINES, PRODUCT_LINE_SLUGS } from "@/lib/productLines";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae";

const STATIC_PATHS = ["", "/catalog", "/realestate", "/about", "/contact", "/careers"];

// Queries Prisma for live product/property slugs — same reasoning as the
// storefront layout's dynamic export: no DB connection exists at build
// time, and the list would go stale immediately if cached anyway.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, properties] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ select: { slug: true, material: true, updatedAt: true } }),
    prisma.property.findMany({ select: { slug: true, updatedAt: true } })
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7
      });
    }
    for (const category of categories) {
      entries.push({
        url: `${SITE_URL}/${locale}${categoryPath(category.slug)}`,
        changeFrequency: "weekly",
        priority: 0.8
      });
    }
    for (const material of CATALOG_MATERIALS) {
      for (const line of MATERIAL_PRODUCT_LINES[material] ?? []) {
        entries.push({
          url: `${SITE_URL}/${locale}/catalog/${MATERIAL_SLUGS[material]}/${PRODUCT_LINE_SLUGS[line]}`,
          changeFrequency: "weekly",
          priority: 0.7
        });
      }
    }
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/${locale}${productPath(product.material, product.slug)}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6
      });
    }
    for (const property of properties) {
      entries.push({
        url: `${SITE_URL}/${locale}/realestate/${property.slug}`,
        lastModified: property.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6
      });
    }
  }

  return entries;
}
