import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { createdAt: "desc" } } }
  });
  if (!invoice) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // Payment.invoiceId is onDelete: SetNull — past payment records survive,
  // just detached from the deleted invoice.
  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
