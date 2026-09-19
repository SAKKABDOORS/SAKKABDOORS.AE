import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { getSiteSetting } from "@/lib/siteContent";
import { renderQuotePdf, type QuotePdfData } from "@/lib/pdf/QuoteDocument";
import { formatQuoteNumber } from "@/lib/quotes";

// See app/api/admin/quote-pdf/[id]/route.ts's comment for why this isn't
// toLocaleDateString("ar-AE", ...).
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
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
