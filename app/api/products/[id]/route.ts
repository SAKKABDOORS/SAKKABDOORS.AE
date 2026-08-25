import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, category: true }
  });
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

const updateSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  material: z.enum(["WPC", "UPVC", "ALUMINUM", "STEEL"]).optional(),
  price: z.number().positive().optional(),
  currency: z.string().min(1).max(10).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  images: z.array(z.string().url()).optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { images, ...rest } = parsed.data;

  if (images) {
    await prisma.productImage.deleteMany({ where: { productId: params.id } });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(images
        ? { images: { create: images.map((url, i) => ({ url, position: i })) } }
        : {})
    },
    include: { images: true, category: true }
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
