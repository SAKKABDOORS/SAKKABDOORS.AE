import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// Public: list products (used by client-side widgets if needed; the
// storefront pages themselves query Prisma directly on the server).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const material = searchParams.get("material") ?? undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(material ? { material: material as never } : {})
    },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}

const productSchema = z.object({
  slug: z.string().min(2).max(120),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  categoryId: z.string().min(1),
  material: z.enum(["WPC", "UPVC", "ALUMINUM", "STEEL"]),
  price: z.number().positive(),
  currency: z.string().min(1).max(10).default("AED"),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  images: z.array(z.string().url()).default([])
});

// Admin-only: create a product.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { images, ...rest } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...rest,
      images: {
        create: images.map((url, i) => ({ url, position: i }))
      }
    },
    include: { images: true, category: true }
  });

  return NextResponse.json(product, { status: 201 });
}
