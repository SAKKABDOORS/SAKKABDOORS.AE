import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

const categoryUpdateSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  taglineAr: z.string().optional(),
  taglineEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  heroImage: z
    .string()
    .url("يجب أن يكون رابط كامل (https://...) — لا يقبل مسار نسبي مثل /images/...")
    .optional()
    .or(z.literal(""))
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { heroImage, ...rest } = parsed.data;

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { ...rest, heroImage: heroImage || null }
  });

  return NextResponse.json(category);
}
