import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

const updateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const customerType = await prisma.customerType.update({ where: { id: params.id }, data: parsed.data });
  await logAudit(session!.email, "update", "CustomerType", customerType.id, `تعديل نوع عميل: ${customerType.nameAr}`);
  return NextResponse.json(customerType);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // customerTypeId is onDelete: SetNull on both QuoteItem and Customer — old
  // quotes keep their snapshotted discountPercent regardless of this delete.
  const customerType = await prisma.customerType.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "CustomerType", customerType.id, `حذف نوع عميل: ${customerType.nameAr}`);
  return NextResponse.json({ ok: true });
}
