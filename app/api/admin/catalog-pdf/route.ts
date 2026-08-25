import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";
import { renderCatalogPdf, type CatalogPdfCategory } from "@/lib/pdf/CatalogDocument";

// A broken/unreachable product image must never fail the whole export — each
// image URL gets a short reachability check first; unreachable ones fall
// back to a plain placeholder box inside the PDF instead of an <Image> tag.
async function isImageReachable(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category") ?? undefined;

  const categories = await prisma.category.findMany({
    where: categorySlug ? { slug: categorySlug } : undefined,
    include: {
      products: {
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  const catalogCategories: CatalogPdfCategory[] = await Promise.all(
    categories
      .filter((c) => c.products.length > 0)
      .map(async (c) => ({
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        products: await Promise.all(
          c.products.map(async (p) => {
            const url = p.images[0]?.url ?? null;
            const reachable = url ? await isImageReachable(url) : false;
            return {
              nameAr: p.nameAr,
              nameEn: p.nameEn,
              price: p.price,
              currency: p.currency,
              material: p.material,
              inStock: p.inStock,
              imageUrl: reachable ? url : null
            };
          })
        )
      }))
  );

  const buffer = await renderCatalogPdf({
    categories: catalogCategories,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "SAKKAB"
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sakkab-catalog-${new Date().toISOString().slice(0, 10)}.pdf"`
    }
  });
}
