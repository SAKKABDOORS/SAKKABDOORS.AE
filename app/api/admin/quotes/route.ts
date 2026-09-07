import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";
import { computeLineTotal, computeQuoteTotals, quoteInputSchema } from "@/lib/quotes";

export async function GET() {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const quotes = await prisma.quote.findMany({ orderBy: { quoteNumber: "desc" } });
  return NextResponse.json(quotes);
}

// sqlite (local dev) can't autoincrement a non-@id field, so this is a plain
// max+1 lookup rather than a DB-level default — see prisma/schema.prisma's
// Quote.quoteNumber comment. Fine for a low-volume admin tool; not meant to
// survive true concurrent creates.
async function nextQuoteNumber(): Promise<number> {
  const last = await prisma.quote.findFirst({ orderBy: { quoteNumber: "desc" }, select: { quoteNumber: true } });
  return (last?.quoteNumber ?? 0) + 1;
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = quoteInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, issueDate, expiryDate, customerEmail, ...rest } = parsed.data;

  // Every total is recomputed here from the submitted line items rather than
  // trusting whatever the client sent — this is the first money-calculating
  // feature in the codebase, worth the extra rigor.
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
      createdByUsername: session!.username,
      items: { create: itemsWithTotals }
    },
    include: { items: true }
  });

  return NextResponse.json(quote, { status: 201 });
}
