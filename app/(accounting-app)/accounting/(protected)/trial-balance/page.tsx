import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { getAccountBalances } from "@/lib/accountingReports";
import { ACCOUNT_TYPE_LABELS, SUSPENSE_ACCOUNT_CODE } from "@/lib/accounts";

export default async function TrialBalancePage() {
  await requireAccountingRole();

  const balances = await getAccountBalances({ includeZero: false });
  const totalDebit = balances.reduce((sum, b) => sum + b.totalDebit, 0);
  const totalCredit = balances.reduce((sum, b) => sum + b.totalCredit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">ميزان المراجعة</h1>

      {!balanced && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تنبيه: الميزان غير متوازن — مجموع المدين لا يساوي مجموع الدائن. راجع القيود.
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الرمز</th>
              <th className="p-3 text-start font-semibold">الحساب</th>
              <th className="p-3 text-start font-semibold">النوع</th>
              <th className="p-3 text-start font-semibold">مدين</th>
              <th className="p-3 text-start font-semibold">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {balances.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-800/60">لا يوجد حركات مسجلة بعد</td>
              </tr>
            )}
            {balances.map((b) => (
              <tr key={b.accountId} className={b.code === SUSPENSE_ACCOUNT_CODE ? "bg-red-50" : ""}>
                <td className="p-3 font-mono text-ink-900">{b.code}</td>
                <td className="p-3 text-ink-900">
                  {b.nameAr}
                  {b.code === SUSPENSE_ACCOUNT_CODE && <span className="ms-2 text-xs font-semibold text-red-700">يحتاج تصنيف</span>}
                </td>
                <td className="p-3 text-ink-800/70">{ACCOUNT_TYPE_LABELS[b.type]}</td>
                <td className="p-3">{b.totalDebit > 0 ? b.totalDebit.toFixed(2) : "—"}</td>
                <td className="p-3">{b.totalCredit > 0 ? b.totalCredit.toFixed(2) : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-200 font-bold text-ink-900">
              <td className="p-3" colSpan={3}>المجموع</td>
              <td className="p-3">{totalDebit.toFixed(2)}</td>
              <td className="p-3">{totalCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
