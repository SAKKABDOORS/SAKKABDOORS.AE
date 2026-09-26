import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { deductStockForItems } from "@/lib/inventory";
import { postInvoiceCreated } from "@/lib/autoPosting";
import { formatInvoiceNumber } from "@/lib/invoices";

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoices = await prisma.invoice.findMany({ orderBy: { invoiceNumber: "desc" } });
  return NextResponse.json(invoices);
}

async function nextInvoiceNumber(): Promise<number> {
  const last = await prisma.invoice.findFirst({ orderBy: { invoiceNumber: "desc" }, select: { invoiceNumber: true } });
  return (last?.invoiceNumber ?? 0) + 1;
}

const createSchema = z.object({ quoteId: z.string().min(1) });

// Invoices are created FROM an accepted Quote — "convert to invoice" — not
// built line-by-line from scratch (that's what a Quote already is). Every
// number is snapshotted at this moment: editing the source Quote afterward
// must never change an already-issued invoice.
export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: parsed.data.quoteId },
    include: { items: { orderBy: { position: "asc" } } }
  });
  if (!quote) {
    return NextResponse.json({ error: "quote_not_found" }, { status: 404 });
  }

  const invoiceNumber = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      quoteId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: quote.items.map((i) => ({
        productId: i.productId,
        descriptionAr: i.descriptionAr,
        descriptionEn: i.descriptionEn,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountPercent: i.discountPercent,
        lineTotal: i.lineTotal
      })),
      subtotal: quote.subtotal,
      totalAmount: quote.grandTotal
    }
  });

  // A converted quote is a confirmed sale — deduct the sold quantities from
  // warehouse stock automatically (items with no catalog product behind
  // them, i.e. free-text lines, are skipped — see lib/inventory.ts).
  await deductStockForItems(
    quote.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    `بيع — فاتورة #${formatInvoiceNumber(invoiceNumber)}`
  );

  // Best-effort — see lib/autoPosting.ts. Never blocks the invoice itself;
  // requires the starter chart of accounts (or equivalent account codes)
  // to already exist, otherwise this quietly does nothing.
  try {
    await postInvoiceCreated(invoice);
  } catch (err) {
    console.error("Failed to auto-post invoice to accounting ledger:", err);
  }

  await logAudit(session!.email, "create", "Invoice", invoice.id, `إضافة فاتورة #${invoice.invoiceNumber}: ${invoice.customerName}`);
  return NextResponse.json(invoice, { status: 201 });
}
