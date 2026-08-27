import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { images: true }
  });
  if (!property) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(property);
}

const updateSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  titleAr: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  currency: z.string().min(1).max(10).optional(),
  regionAr: z.string().min(1).optional(),
  regionEn: z.string().min(1).optional(),
  images: z.array(z.string().url("يجب أن يكون رابط كامل (https://...) — لا يقبل مسار نسبي مثل /images/...")).optional()
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
    await prisma.propertyImage.deleteMany({ where: { propertyId: params.id } });
  }

  const property = await prisma.property.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(images
        ? { images: { create: images.map((url, i) => ({ url, position: i })) } }
        : {})
    },
    include: { images: true }
  });

  return NextResponse.json(property);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
