import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";
import { formatInvoiceNumber, INVOICE_STATUS_LABELS } from "@/lib/invoices";

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoices = await prisma.invoice.findMany({ orderBy: { invoiceNumber: "desc" } });

  const csv = toCsv(
    ["رقم الفاتورة", "التاريخ", "الزبون", "الهاتف", "الإجمالي", "المدفوع", "المتبقي", "الحالة"],
    invoices.map((inv) => [
      formatInvoiceNumber(inv.invoiceNumber),
      inv.createdAt.toISOString().slice(0, 10),
      inv.customerName,
      inv.customerPhone,
      inv.totalAmount.toFixed(2),
      inv.paidAmount.toFixed(2),
      (inv.totalAmount - inv.paidAmount).toFixed(2),
      INVOICE_STATUS_LABELS[inv.status]
    ])
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
