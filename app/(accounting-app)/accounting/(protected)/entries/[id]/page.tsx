import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { formatEntryNumber } from "@/lib/journalEntries";
import DeleteJournalEntryButton from "@/components/DeleteJournalEntryButton";

export default async function JournalEntryDetailPage({ params }: { params: { id: string } }) {
  await requireAccountingRole();

  const entry = await prisma.journalEntry.findUnique({
    where: { id: params.id },
    include: { lines: { include: { account: true }, orderBy: { position: "asc" } } }
  });
  if (!entry) notFound();

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">قيد #{formatEntryNumber(entry.entryNumber)}</h1>
        {!entry.sourceType && <DeleteJournalEntryButton entryId={entry.id} />}
      </div>

      <div className="card space-y-2 p-6">
        <p className="text-sm"><span className="font-bold text-brand-700">التاريخ:</span> {new Date(entry.date).toLocaleDateString("ar-AE")}</p>
        <p className="text-sm"><span className="font-bold text-brand-700">الوصف:</span> {entry.description}</p>
        {entry.reference && <p className="text-sm"><span className="font-bold text-brand-700">المرجع:</span> {entry.reference}</p>}
        <p className="text-sm">
          <span className="font-bold text-brand-700">المصدر:</span>{" "}
          {entry.sourceType ? `تلقائي (${entry.sourceType})` : "يدوي"}
        </p>
        <p className="text-sm"><span className="font-bold text-brand-700">بواسطة:</span> {entry.createdByEmail}</p>
      </div>

      <div className="card overflow-x-auto p-6">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100">
            <tr>
              <th className="p-2 text-start font-semibold">الحساب</th>
              <th className="p-2 text-start font-semibold">ملاحظة</th>
              <th className="p-2 text-start font-semibold">مدين</th>
              <th className="p-2 text-start font-semibold">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {entry.lines.map((line) => (
              <tr key={line.id}>
                <td className="p-2 text-ink-900">{line.account.code} — {line.account.nameAr}</td>
                <td className="p-2 text-ink-800/70">{line.note ?? "—"}</td>
                <td className="p-2">{line.debit > 0 ? line.debit.toFixed(2) : "—"}</td>
                <td className="p-2">{line.credit > 0 ? line.credit.toFixed(2) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-200 font-bold text-ink-900">
              <td className="p-2" colSpan={2}>المجموع</td>
              <td className="p-2">{totalDebit.toFixed(2)}</td>
              <td className="p-2">{totalCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
