import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

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
  const { response } = await requireSystemUser();
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

  return NextResponse.json(invoice, { status: 201 });
}
