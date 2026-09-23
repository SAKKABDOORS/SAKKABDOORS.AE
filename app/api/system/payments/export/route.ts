import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { toCsv } from "@/lib/csv";

const CATEGORY_LABELS: Record<string, string> = {
  invoice: "فاتورة",
  salary: "راتب",
  voucher: "سند قبض",
  deduction: "خصم"
};

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoice: { select: { invoiceNumber: true, customerName: true } } }
  });

  const csv = toCsv(
    ["التاريخ", "النوع", "التصنيف", "المبلغ", "طريقة الدفع", "مرتبط بـ", "ملاحظة"],
    payments.map((p) => [
      p.createdAt.toISOString().slice(0, 10),
      p.type === "INCOME" ? "دخل" : "مصروف",
      CATEGORY_LABELS[p.category] ?? p.category,
      p.amount.toFixed(2),
      p.method ?? "",
      p.invoice ? `فاتورة #${p.invoice.invoiceNumber} — ${p.invoice.customerName}` : "",
      p.note ?? ""
    ])
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
