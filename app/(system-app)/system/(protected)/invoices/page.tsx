import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import { formatInvoiceNumber, INVOICE_STATUS_LABELS } from "@/lib/invoices";

const STATUS_BADGE_CLASS: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700"
};

export default async function SystemInvoicesPage() {
  await requireSystemRole("invoices");

  const invoices = await prisma.invoice.findMany({ orderBy: { invoiceNumber: "desc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">الفواتير</h1>
      <p className="mb-4 text-sm text-ink-800/60">
        الفواتير تُنشأ من عرض سعر موافَق عليه — افتح عرض السعر واضغط "تحويل لفاتورة".
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">رقم الفاتورة</th>
              <th className="p-3 text-start font-semibold">الزبون</th>
              <th className="p-3 text-start font-semibold">الإجمالي</th>
              <th className="p-3 text-start font-semibold">المدفوع</th>
              <th className="p-3 text-start font-semibold">الحالة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-800/60">
                  لا يوجد فواتير بعد
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="p-3 font-mono text-ink-900">#{formatInvoiceNumber(inv.invoiceNumber)}</td>
                <td className="p-3 font-medium text-ink-900">{inv.customerName}</td>
                <td className="p-3 text-ink-800/70">{inv.totalAmount.toFixed(2)} AED</td>
                <td className="p-3 text-ink-800/70">{inv.paidAmount.toFixed(2)} AED</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <a href={`/api/system/invoice-pdf/${inv.id}`} download className="btn-secondary py-1.5 px-3 text-xs">
                      PDF
                    </a>
                    <Link href={`/invoices/${inv.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                      عرض
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
