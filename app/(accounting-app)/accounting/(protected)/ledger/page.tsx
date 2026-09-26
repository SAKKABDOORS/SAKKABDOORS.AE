import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { normalBalanceFor } from "@/lib/accounts";
import { formatEntryNumber } from "@/lib/journalEntries";
import Link from "next/link";

export default async function GeneralLedgerPage({ searchParams }: { searchParams: { accountId?: string } }) {
  await requireAccountingRole();

  const accounts = await prisma.account.findMany({ orderBy: { code: "asc" } });
  const selectedAccount = searchParams.accountId ? accounts.find((a) => a.id === searchParams.accountId) : undefined;

  const lines = selectedAccount
    ? await prisma.journalEntryLine.findMany({
        where: { accountId: selectedAccount.id },
        include: { journalEntry: true },
        orderBy: { journalEntry: { date: "asc" } }
      })
    : [];

  let runningBalance = 0;
  const rows = lines.map((line) => {
    runningBalance += selectedAccount ? normalBalanceFor(selectedAccount.type, line.debit, line.credit) : 0;
    return { line, runningBalance };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">دفتر الأستاذ</h1>
        {selectedAccount && (
          <a href={`/api/accounting/ledger/export?accountId=${selectedAccount.id}`} download className="btn-secondary py-1.5 px-3 text-xs">
            تصدير Excel
          </a>
        )}
      </div>

      <form method="GET" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px]">
          <label className="label">الحساب</label>
          <select className="input" name="accountId" defaultValue={searchParams.accountId ?? ""}>
            <option value="">اختر حساب</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.nameAr}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary py-2 px-4 text-sm">عرض</button>
      </form>

      {!selectedAccount ? (
        <p className="text-sm text-ink-800/60">اختر حساب حتى تشوف حركاته.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 bg-brand-50">
              <tr>
                <th className="p-3 text-start font-semibold">التاريخ</th>
                <th className="p-3 text-start font-semibold">القيد</th>
                <th className="p-3 text-start font-semibold">الوصف</th>
                <th className="p-3 text-start font-semibold">مدين</th>
                <th className="p-3 text-start font-semibold">دائن</th>
                <th className="p-3 text-start font-semibold">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-800/60">لا يوجد حركات مسجلة بعد لهذا الحساب</td>
                </tr>
              )}
              {rows.map(({ line, runningBalance: balance }) => (
                <tr key={line.id}>
                  <td className="p-3 text-ink-800/70">{new Date(line.journalEntry.date).toLocaleDateString("ar-AE")}</td>
                  <td className="p-3">
                    <Link href={`/entries/${line.journalEntry.id}`} className="font-mono text-brand-700 hover:underline">
                      #{formatEntryNumber(line.journalEntry.entryNumber)}
                    </Link>
                  </td>
                  <td className="p-3 text-ink-900">{line.journalEntry.description}</td>
                  <td className="p-3">{line.debit > 0 ? line.debit.toFixed(2) : "—"}</td>
                  <td className="p-3">{line.credit > 0 ? line.credit.toFixed(2) : "—"}</td>
                  <td className="p-3 font-semibold text-ink-900">{balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
