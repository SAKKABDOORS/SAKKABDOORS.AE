import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { formatEntryNumber } from "@/lib/journalEntries";

export default async function JournalEntriesPage() {
  await requireAccountingRole();

  const entries = await prisma.journalEntry.findMany({
    include: { lines: true },
    orderBy: { entryNumber: "desc" }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">القيود اليومية</h1>
        <div className="flex gap-2">
          <a href="/api/accounting/entries/export" download className="btn-secondary py-1.5 px-3 text-xs">
            تصدير Excel
          </a>
          <Link href="/entries/new" className="btn-primary">إضافة قيد</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">رقم القيد</th>
              <th className="p-3 text-start font-semibold">التاريخ</th>
              <th className="p-3 text-start font-semibold">الوصف</th>
              <th className="p-3 text-start font-semibold">المصدر</th>
              <th className="p-3 text-start font-semibold">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-800/60">لا يوجد قيود بعد</td>
              </tr>
            )}
            {entries.map((entry) => {
              const total = entry.lines.reduce((sum, l) => sum + l.debit, 0);
              return (
                <tr key={entry.id}>
                  <td className="p-3">
                    <Link href={`/entries/${entry.id}`} className="font-mono text-brand-700 hover:underline">
                      #{formatEntryNumber(entry.entryNumber)}
                    </Link>
                  </td>
                  <td className="p-3 text-ink-800/70">{new Date(entry.date).toLocaleDateString("ar-AE")}</td>
                  <td className="p-3 text-ink-900">{entry.description}</td>
                  <td className="p-3 text-ink-800/70">{entry.sourceType ? "تلقائي" : "يدوي"}</td>
                  <td className="p-3 font-semibold text-ink-900">{total.toFixed(2)} AED</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
