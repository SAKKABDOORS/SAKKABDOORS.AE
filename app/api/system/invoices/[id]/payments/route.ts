import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { computeInvoiceStatus } from "@/lib/invoices";

const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.string().max(100).optional(),
  note: z.string().max(500).optional()
});

// Records one payment against this invoice and recomputes its
// paidAmount/status from the actual sum of payments (not just adding the
// new amount) — keeps the invoice consistent even if a payment is later
// edited/removed directly in the ledger (Phase 5).
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.payment.create({
    data: {
      type: "INCOME",
      category: "invoice",
      amount: parsed.data.amount,
      method: parsed.data.method || null,
      note: parsed.data.note || null,
      invoiceId: invoice.id
    }
  });

  const { _sum } = await prisma.payment.aggregate({
    where: { invoiceId: invoice.id },
    _sum: { amount: true }
  });
  const paidAmount = _sum.amount ?? 0;

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paidAmount, status: computeInvoiceStatus(invoice.totalAmount, paidAmount) },
    include: { payments: { orderBy: { createdAt: "desc" } } }
  });

  return NextResponse.json(updated);
}
