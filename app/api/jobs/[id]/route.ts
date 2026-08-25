import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

const updateSchema = z.object({
  titleAr: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  locationAr: z.string().min(1).optional(),
  locationEn: z.string().min(1).optional(),
  descriptionAr: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional()
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

  const job = await prisma.job.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(job);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
