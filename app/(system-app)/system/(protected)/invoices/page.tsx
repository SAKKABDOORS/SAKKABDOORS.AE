import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import { formatInvoiceNumber, INVOICE_STATUS_LABELS } from "@/lib/invoices";
import SystemSearchBar from "@/components/SystemSearchBar";

const STATUS_BADGE_CLASS: Record<string, string> = {
  UNPAID: "bg-red-50 text-red-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700"
};

export default async function SystemInvoicesPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  await requireSystemRole("invoices");

  const q = searchParams.q?.trim();
  const status = searchParams.status;
  const asNumber = q ? Number(q.replace(/^#|^0+/, "")) : NaN;
  const validStatus = status && ["UNPAID", "PARTIALLY_PAID", "PAID"].includes(status) ? status : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(validStatus ? { status: validStatus as never } : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q } },
              ...(Number.isFinite(asNumber) && asNumber > 0 ? [{ invoiceNumber: asNumber }] : [])
            ]
          }
        : {})
    },
    orderBy: { invoiceNumber: "desc" }
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">الفواتير</h1>
        <a href="/api/system/invoices/export" download className="btn-secondary py-1.5 px-3 text-xs">
          تصدير Excel
        </a>
      </div>
      <p className="mb-4 text-sm text-ink-800/60">
        الفواتير تُنشأ من عرض سعر موافَق عليه — افتح عرض السعر واضغط "تحويل لفاتورة".
      </p>

      <SystemSearchBar
        action="/invoices"
        q={q}
        hasFilter={Boolean(q || validStatus)}
        placeholder="اسم الزبون، الهاتف، أو رقم الفاتورة"
        extra={
          <div>
            <label className="label">الحالة</label>
            <select className="input" name="status" defaultValue={validStatus ?? ""}>
              <option value="">الكل</option>
              <option value="UNPAID">{INVOICE_STATUS_LABELS.UNPAID}</option>
              <option value="PARTIALLY_PAID">{INVOICE_STATUS_LABELS.PARTIALLY_PAID}</option>
              <option value="PAID">{INVOICE_STATUS_LABELS.PAID}</option>
            </select>
          </div>
        }
      />

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
                  {q || validStatus ? "ما في نتائج مطابقة" : "لا يوجد فواتير بعد"}
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const isOverdue = inv.dueDate && inv.dueDate < new Date() && inv.status !== "PAID";
              return (
              <tr key={inv.id}>
                <td className="p-3 font-mono text-ink-900">#{formatInvoiceNumber(inv.invoiceNumber)}</td>
                <td className="p-3 font-medium text-ink-900">{inv.customerName}</td>
                <td className="p-3 text-ink-800/70">{inv.totalAmount.toFixed(2)} AED</td>
                <td className="p-3 text-ink-800/70">{inv.paidAmount.toFixed(2)} AED</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status as keyof typeof INVOICE_STATUS_LABELS]}
                  </span>
                  {isOverdue && (
                    <span className="ms-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">متأخرة</span>
                  )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
