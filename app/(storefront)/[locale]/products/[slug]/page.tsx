import { permanentRedirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isLocale } from "@/lib/i18n/config";
import { MATERIAL_PATHS, productPath } from "@/lib/materialPaths";

// /products/[slug] used to serve both a category grid (/products/wpc-doors)
// and a product detail page (/products/some-door-slug) — each material now
// has its own top-level section (/wpc, /aluminum, /composite), so this
// route just redirects old links to the new location instead of 404ing.
// Permanent (308) so search engines transfer this URL's ranking signals to
// the new one instead of continuing to index the old path.
const CATEGORY_SLUG_TO_PATH: Record<string, string> = {
  "wpc-doors": MATERIAL_PATHS.WPC,
  "upvc-doors": MATERIAL_PATHS.UPVC,
  "aluminum-doors": MATERIAL_PATHS.ALUMINUM
};

export default async function LegacyProductOrCategoryRedirect({
  params
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();

  const newSectionPath = CATEGORY_SLUG_TO_PATH[params.slug];
  if (newSectionPath) {
    permanentRedirect(`/${params.locale}/${newSectionPath}`);
  }

  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) notFound();

  permanentRedirect(`/${params.locale}${productPath(product.material, product.slug)}`);
}
