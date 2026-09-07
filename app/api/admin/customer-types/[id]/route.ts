import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

const updateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const customerType = await prisma.customerType.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(customerType);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  // customerTypeId on QuoteItem is onDelete: SetNull — old quotes keep their
  // already-snapshotted discountPercent regardless of this delete.
  await prisma.customerType.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
