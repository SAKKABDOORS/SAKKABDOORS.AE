import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";
import { getSiteSetting } from "@/lib/siteContent";
import { renderQuotePdf, type QuotePdfData } from "@/lib/pdf/QuoteDocument";
import { formatQuoteNumber } from "@/lib/quotes";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ar-AE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: { items: { orderBy: { position: "asc" } } }
  });
  if (!quote) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const footer = await getSiteSetting("footer");

  const payload: QuotePdfData = {
    quoteNumber: quote.quoteNumber,
    issueDate: formatDate(quote.issueDate),
    expiryDate: quote.expiryDate ? formatDate(quote.expiryDate) : null,
    customerName: quote.customerName,
    customerPhone: quote.customerPhone,
    customerEmail: quote.customerEmail,
    customerAddress: quote.customerAddress,
    customerNumber: quote.customerNumber,
    addressedTo: quote.addressedTo,
    responsibleName: quote.responsibleName,
    responsiblePhone: quote.responsiblePhone,
    items: quote.items.map((item) => ({
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: item.lineTotal
    })),
    shippingFee: quote.shippingFee,
    discountAmount: quote.discountAmount,
    subtotal: quote.subtotal,
    grandTotal: quote.grandTotal,
    currency: quote.currency,
    termsAr: quote.termsAr,
    termsEn: quote.termsEn,
    customerNote: quote.customerNote,
    companyEmail: footer.email,
    companyBranches: footer.locations.map((loc) => ({ name: loc.name.ar, phone: `+${loc.phone}` }))
  };

  const buffer = await renderQuotePdf(payload);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${formatQuoteNumber(quote.quoteNumber)}.pdf"`
    }
  });
}
