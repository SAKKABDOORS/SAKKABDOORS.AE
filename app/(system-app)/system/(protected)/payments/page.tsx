import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import ManualPaymentForm from "@/components/ManualPaymentForm";
import DeletePaymentButton from "@/components/DeletePaymentButton";
import SystemSearchBar from "@/components/SystemSearchBar";

const CATEGORY_LABELS: Record<string, string> = {
  invoice: "فاتورة",
  salary: "راتب",
  voucher: "سند قبض",
  deduction: "خصم"
};

export default async function SystemPaymentsPage({ searchParams }: { searchParams: { q?: string; type?: string } }) {
  await requireSystemRole("payments");

  const q = searchParams.q?.trim().toLowerCase();
  const type = searchParams.type;
  const validType = type === "INCOME" || type === "EXPENSE" ? type : undefined;

  const allPayments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoice: { select: { invoiceNumber: true, customerName: true } } }
  });

  // Totals always reflect everything, regardless of the search/filter below
  // — a search shouldn't make "إجمالي الدخل" look wrong.
  const totalIncome = allPayments.filter((p) => p.type === "INCOME").reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = allPayments.filter((p) => p.type === "EXPENSE").reduce((sum, p) => sum + p.amount, 0);

  const payments = allPayments.filter((p) => {
    if (validType && p.type !== validType) return false;
    if (!q) return true;
    const haystack = [p.category, p.method, p.note, p.invoice?.customerName].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">المدفوعات</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-ink-800/60">إجمالي الدخل</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{totalIncome.toFixed(2)} AED</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-800/60">إجمالي المصروف</p>
          <p className="mt-1 text-xl font-bold text-red-700">{totalExpense.toFixed(2)} AED</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-800/60">الصافي</p>
          <p className="mt-1 text-xl font-bold text-brand-700">{(totalIncome - totalExpense).toFixed(2)} AED</p>
        </div>
      </div>

      <ManualPaymentForm />

      <SystemSearchBar
        action="/payments"
        q={searchParams.q}
        hasFilter={Boolean(searchParams.q || validType)}
        placeholder="التصنيف، الملاحظة، أو اسم العميل"
        extra={
          <div>
            <label className="label">النوع</label>
            <select className="input" name="type" defaultValue={validType ?? ""}>
              <option value="">الكل</option>
              <option value="INCOME">دخل</option>
              <option value="EXPENSE">مصروف</option>
            </select>
          </div>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">التاريخ</th>
              <th className="p-3 text-start font-semibold">النوع</th>
              <th className="p-3 text-start font-semibold">التصنيف</th>
              <th className="p-3 text-start font-semibold">المبلغ</th>
              <th className="p-3 text-start font-semibold">مرتبط بـ</th>
              <th className="p-3 text-start font-semibold">ملاحظة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink-800/60">
                  {q || validType ? "ما في نتائج مطابقة" : "لا يوجد حركات مسجلة بعد"}
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-3 whitespace-nowrap text-ink-800/70">{new Date(p.createdAt).toLocaleString("ar-AE")}</td>
                <td className="p-3">
                  <span className={p.type === "INCOME" ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                    {p.type === "INCOME" ? "دخل" : "مصروف"}
                  </span>
                </td>
                <td className="p-3 text-ink-800/70">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                <td className="p-3 font-semibold text-ink-900">{p.amount.toFixed(2)} AED</td>
                <td className="p-3 text-ink-800/70">
                  {p.invoice ? `فاتورة #${p.invoice.invoiceNumber} — ${p.invoice.customerName}` : "—"}
                </td>
                <td className="p-3 text-ink-800/70">{[p.method, p.note].filter(Boolean).join(" — ") || "—"}</td>
                <td className="p-3">
                  <DeletePaymentButton paymentId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
