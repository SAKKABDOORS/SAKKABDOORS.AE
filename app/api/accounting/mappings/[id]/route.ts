import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER"]);
  if (response) return response;

  const mapping = await prisma.categoryAccountMapping.delete({ where: { id: params.id } }).catch(() => null);
  if (!mapping) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await logAudit(session!.email, "delete", "CategoryAccountMapping", mapping.id, `حذف ربط تصنيف "${mapping.category}"`);
  return NextResponse.json({ ok: true });
}
