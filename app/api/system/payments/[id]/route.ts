import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { computeInvoiceStatus } from "@/lib/invoices";
import { logAudit } from "@/lib/auditLog";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.payment.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "Payment", payment.id, `حذف ${payment.type === "INCOME" ? "دخل" : "مصروف"} ${payment.amount.toFixed(2)} — ${payment.category}`);

  // Deleting a payment that was recorded against an invoice must roll that
  // invoice's paidAmount/status back — same recompute-from-actual-sum
  // logic as recording one (see /api/system/invoices/[id]/payments).
  if (payment.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
    if (invoice) {
      const { _sum } = await prisma.payment.aggregate({
        where: { invoiceId: invoice.id },
        _sum: { amount: true }
      });
      const paidAmount = _sum.amount ?? 0;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount, status: computeInvoiceStatus(invoice.totalAmount, paidAmount) }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
