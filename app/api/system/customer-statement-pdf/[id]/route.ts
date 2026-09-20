import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { getSiteSetting } from "@/lib/siteContent";
import { renderStatementPdf, type StatementPdfData } from "@/lib/pdf/StatementDocument";

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { invoices: { orderBy: { invoiceNumber: "desc" } } }
  });
  if (!customer) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const footer = await getSiteSetting("footer");

  const payload: StatementPdfData = {
    customerName: customer.nameAr,
    customerPhone: customer.phone,
    generatedDate: formatDate(new Date()),
    currency: "AED",
    invoices: customer.invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: formatDate(inv.createdAt),
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      status: inv.status
    })),
    companyEmail: footer.email,
    companyBranches: footer.locations.map((loc) => ({ name: loc.name.ar, phone: `+${loc.phone}` }))
  };

  const buffer = await renderStatementPdf(payload);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="statement-${customer.id}.pdf"`
    }
  });
}
