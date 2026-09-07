import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";
import { computeLineTotal, computeQuoteTotals, quoteInputSchema } from "@/lib/quotes";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
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

  // The form always submits the complete current item list, not a diff, so
  // the simplest correct write is drop-and-recreate rather than trying to
  // match rows up with the previous set — fine for a low-volume admin tool.
  const quote = await prisma.quote.update({
    where: { id: params.id },
    data: {
      ...rest,
      customerEmail: customerEmail || null,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      subtotal,
      grandTotal,
      items: { deleteMany: {}, create: itemsWithTotals }
    },
    include: { items: true }
  });

  return NextResponse.json(quote);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  await prisma.quote.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
