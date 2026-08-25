import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// Public: list properties (used by the /realestate storefront page's own
// server-side Prisma query too, but exposed here the same way products are).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? undefined;

  const properties = await prisma.property.findMany({
    where: region ? { regionAr: region } : undefined,
    include: { images: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(properties);
}

const propertySchema = z.object({
  slug: z.string().min(2).max(120),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  price: z.number().positive(),
  currency: z.string().min(1).max(10).default("AED"),
  regionAr: z.string().min(1),
  regionEn: z.string().min(1),
  images: z.array(z.string().url()).default([])
});

// Admin-only: create a property listing.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = propertySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { images, ...rest } = parsed.data;

  const property = await prisma.property.create({
    data: {
      ...rest,
      images: {
        create: images.map((url, i) => ({ url, position: i }))
      }
    },
    include: { images: true }
  });

  return NextResponse.json(property, { status: 201 });
}
