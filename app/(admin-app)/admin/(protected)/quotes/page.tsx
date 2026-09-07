import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteQuoteButton from "@/components/DeleteQuoteButton";
import { requirePageRole } from "@/lib/requirePageRole";
import { formatQuoteNumber } from "@/lib/quotes";

export default async function AdminQuotesPage() {
  await requirePageRole("quotes");

  const quotes = await prisma.quote.findMany({ orderBy: { quoteNumber: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">عروض الأسعار</h1>
          <Link href="/admin/customer-types" className="text-sm text-brand-700 hover:underline">
            إدارة أنواع العملاء والخصومات
          </Link>
        </div>
        <Link href="/admin/quotes/new" className="btn-primary">عرض سعر جديد</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">رقم العرض</th>
              <th className="p-3 text-start font-semibold">الزبون</th>
              <th className="p-3 text-start font-semibold">التاريخ</th>
              <th className="p-3 text-start font-semibold">الإجمالي</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-800/60">
                  لا يوجد عروض أسعار بعد
                </td>
              </tr>
            )}
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="p-3 font-mono text-ink-900">#{formatQuoteNumber(q.quoteNumber)}</td>
                <td className="p-3 font-medium text-ink-900">{q.customerName}</td>
                <td className="p-3 text-ink-800/70">{new Date(q.issueDate).toLocaleDateString("ar-AE")}</td>
                <td className="p-3 font-semibold text-brand-700">{q.grandTotal.toFixed(2)} {q.currency}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <a href={`/api/admin/quote-pdf/${q.id}`} download className="btn-secondary py-1.5 px-3 text-xs">
                      PDF
                    </a>
                    <Link href={`/admin/quotes/${q.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteQuoteButton quoteId={q.id} />
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
