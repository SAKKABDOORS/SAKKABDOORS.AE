import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { postStandalonePayment } from "@/lib/autoPosting";

// Unified income/expense ledger — invoice payments land here too (created
// via /api/system/invoices/[id]/payments), this route only handles the
// list and standalone entries not tied to any invoice (e.g. a cash
// expense). Employee wages/vouchers/deductions will join in as more
// `category` values once that phase exists — no schema change needed,
// category stays a free string.
export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoice: { select: { invoiceNumber: true, customerName: true } } }
  });
  return NextResponse.json(payments);
}

const manualPaymentSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1).max(100),
  amount: z.number().positive(),
  method: z.string().max(100).optional(),
  note: z.string().max(500).optional()
});

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = manualPaymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      method: parsed.data.method || null,
      note: parsed.data.note || null
    }
  });

  // Best-effort — see lib/autoPosting.ts.
  try {
    await postStandalonePayment(payment);
  } catch (err) {
    console.error("Failed to auto-post manual payment to accounting ledger:", err);
  }

  const typeLabel = parsed.data.type === "INCOME" ? "دخل" : "مصروف";
  await logAudit(session!.email, "create", "Payment", payment.id, `تسجيل ${typeLabel} يدوي ${parsed.data.amount.toFixed(2)} — ${parsed.data.category}`);
  return NextResponse.json(payment, { status: 201 });
}
