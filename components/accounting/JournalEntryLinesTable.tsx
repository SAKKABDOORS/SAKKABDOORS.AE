import type { Account } from "@prisma/client";
import type { JournalLineInput } from "@/lib/journalEntries";
import { computeEntryTotals } from "@/lib/journalEntries";

export const emptyLine: JournalLineInput = { accountId: "", debit: 0, credit: 0, note: "" };

export default function JournalEntryLinesTable({
  lines,
  onChange,
  accounts
}: {
  lines: JournalLineInput[];
  onChange: (lines: JournalLineInput[]) => void;
  accounts: Account[];
}) {
  function updateLine(index: number, patch: Partial<JournalLineInput>) {
    const next = [...lines];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  const { totalDebit, totalCredit } = computeEntryTotals(lines);
  const balanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.005;

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-2 text-start font-semibold">الحساب</th>
              <th className="p-2 text-start font-semibold">ملاحظة</th>
              <th className="p-2 text-start font-semibold">مدين</th>
              <th className="p-2 text-start font-semibold">دائن</th>
              <th className="p-2"><span className="sr-only">حذف</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="p-2">
                  <select className="input" value={line.accountId} onChange={(e) => updateLine(i, { accountId: e.target.value })}>
                    <option value="">اختر حساب</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} — {a.nameAr}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input className="input" value={line.note ?? ""} onChange={(e) => updateLine(i, { note: e.target.value })} />
                </td>
                <td className="p-2">
                  <input
                    className="input w-28"
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.debit || ""}
                    onChange={(e) => updateLine(i, { debit: Number(e.target.value) || 0, credit: 0 })}
                  />
                </td>
                <td className="p-2">
                  <input
                    className="input w-28"
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.credit || ""}
                    onChange={(e) => updateLine(i, { credit: Number(e.target.value) || 0, debit: 0 })}
                  />
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-200 font-bold">
              <td className="p-2" colSpan={2}>
                المجموع{" "}
                {balanced ? (
                  <span className="text-emerald-700">متوازن ✓</span>
                ) : (
                  <span className="text-red-700">غير متوازن</span>
                )}
              </td>
              <td className="p-2 text-ink-900">{totalDebit.toFixed(2)}</td>
              <td className="p-2 text-ink-900">{totalCredit.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <button type="button" onClick={() => onChange([...lines, { ...emptyLine }])} className="btn-secondary">
        + إضافة سطر
      </button>
    </div>
  );
}
