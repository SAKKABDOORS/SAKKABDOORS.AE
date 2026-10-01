import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public, read-only, CORS-enabled catalog feed for the SAKKAB mobile app —
// deliberately a separate route from /api/products, which is an internal
// endpoint (used by the system/admin quote builder's product picker) with
// a different shape; changing that one would break it. This one merges
// Product (doors) and Property (real estate) into one flat list, since
// SAKKAB sells both and the app shows a single catalog.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Displayed as "COMPOSITE" everywhere else in the UI (storefront, catalog
// PDF, AI assistant copy) — see lib/pdf/CatalogDocument.tsx's own
// MATERIAL_LABELS_AR for the same mapping. Kept as UPVC internally only
// because renaming the enum value would need a data migration.
const CATEGORY_LABELS: Record<string, string> = {
  WPC: "WPC",
  UPVC: "COMPOSITE",
  ALUMINUM: "ALUMINUM",
  STEEL: "STEEL"
};

export async function GET() {
  const [products, properties] = await Promise.all([
    prisma.product.findMany({
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.property.findMany({
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const items = [
    ...products.map((p) => ({
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      category: CATEGORY_LABELS[p.material] ?? p.material,
      material: p.material,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      price: p.price,
      currency: p.currency,
      mainImageUrl: p.images[0]?.url ?? null,
      available: p.inStock
    })),
    ...properties.map((prop) => ({
      id: prop.id,
      nameAr: prop.titleAr,
      nameEn: prop.titleEn,
      category: "REAL_ESTATE",
      material: null,
      descriptionAr: prop.descriptionAr,
      descriptionEn: prop.descriptionEn,
      price: prop.price,
      currency: prop.currency,
      mainImageUrl: prop.images[0]?.url ?? null,
      available: true
    }))
  ];

  return NextResponse.json(items, { headers: corsHeaders });
}
