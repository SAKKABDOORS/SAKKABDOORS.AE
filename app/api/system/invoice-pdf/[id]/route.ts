import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { getSiteSetting } from "@/lib/siteContent";
import { renderInvoicePdf, type InvoicePdfData } from "@/lib/pdf/InvoiceDocument";
import { formatInvoiceNumber, invoiceItemSchema } from "@/lib/invoices";

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const items = invoiceItemSchema.array().parse(invoice.items);
  const footer = await getSiteSetting("footer");

  const payload: InvoicePdfData = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: formatDate(invoice.createdAt),
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    items,
    subtotal: invoice.subtotal,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    status: invoice.status,
    currency: "AED",
    companyEmail: footer.email,
    companyBranches: footer.locations.map((loc) => ({ name: loc.name.ar, phone: `+${loc.phone}` }))
  };

  const buffer = await renderInvoicePdf(payload);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${formatInvoiceNumber(invoice.invoiceNumber)}.pdf"`
    }
  });
}
