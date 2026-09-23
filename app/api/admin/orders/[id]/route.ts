import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  // OrderItem is onDelete: Cascade — deleted automatically. Quote.orderId
  // is onDelete: SetNull — a quote already created from this order keeps
  // its own snapshotted fields and just loses the back-reference.
  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
