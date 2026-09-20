import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { computeLineTotal, computeQuoteTotals, quoteInputSchema } from "@/lib/quotes";
import { logAudit } from "@/lib/auditLog";

// Same Quote/QuoteItem tables /admin/quotes already manages — see the Phase
// 3 plan: this is a second, system-auth-gated surface onto the shared data,
// not a separate copy. Mirrors app/api/admin/quotes/route.ts exactly.
export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const quotes = await prisma.quote.findMany({ orderBy: { quoteNumber: "desc" } });
  return NextResponse.json(quotes);
}

async function nextQuoteNumber(): Promise<number> {
  const last = await prisma.quote.findFirst({ orderBy: { quoteNumber: "desc" }, select: { quoteNumber: true } });
  return (last?.quoteNumber ?? 0) + 1;
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = quoteInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, issueDate, expiryDate, customerEmail, ...rest } = parsed.data;

  const itemsWithTotals = items.map((item, i) => ({
    productId: item.productId || null,
    descriptionAr: item.descriptionAr,
    descriptionEn: item.descriptionEn,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    customerTypeId: item.customerTypeId || null,
    discountPercent: item.discountPercent,
    lineTotal: computeLineTotal(item),
    position: i
  }));
  const { subtotal, grandTotal } = computeQuoteTotals(items, rest.shippingFee, rest.discountAmount);

  const quoteNumber = await nextQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      ...rest,
      quoteNumber,
      customerEmail: customerEmail || null,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      subtotal,
      grandTotal,
      createdByUsername: session!.email,
      items: { create: itemsWithTotals }
    },
    include: { items: true }
  });

  await logAudit(session!.email, "create", "Quote", quote.id, `إضافة عرض سعر #${quote.quoteNumber}: ${quote.customerName}`);
  return NextResponse.json(quote, { status: 201 });
}
