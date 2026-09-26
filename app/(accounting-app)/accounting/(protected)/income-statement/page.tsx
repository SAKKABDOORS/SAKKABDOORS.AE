import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { getAccountBalances } from "@/lib/accountingReports";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function IncomeStatementPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  await requireAccountingRole();

  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  const from = searchParams.from ? new Date(searchParams.from) : firstOfMonth(to);

  const rows = await getAccountBalances({ from, to, types: ["INCOME", "EXPENSE"], includeZero: false });
  const income = rows.filter((r) => r.type === "INCOME");
  const expense = rows.filter((r) => r.type === "EXPENSE");
  const totalIncome = income.reduce((sum, r) => sum + r.balance, 0);
  const totalExpense = expense.reduce((sum, r) => sum + r.balance, 0);
  const netIncome = totalIncome - totalExpense;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">قائمة الدخل</h1>
        <a
          href={`/api/accounting/income-statement/export?from=${toDateInputValue(from)}&to=${toDateInputValue(to)}`}
          download
          className="btn-secondary py-1.5 px-3 text-xs"
        >
          تصدير Excel
        </a>
      </div>

      <form method="GET" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">من تاريخ</label>
          <input className="input" type="date" name="from" defaultValue={toDateInputValue(from)} />
        </div>
        <div>
          <label className="label">إلى تاريخ</label>
          <input className="input" type="date" name="to" defaultValue={toDateInputValue(to)} />
        </div>
        <button type="submit" className="btn-secondary py-2 px-4 text-sm">عرض</button>
      </form>

      <div className="card p-6">
        <h2 className="mb-3 font-bold text-ink-900">الإيرادات</h2>
        {income.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد إيرادات بهذه الفترة</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-brand-100">
              {income.map((r) => (
                <tr key={r.accountId}>
                  <td className="py-2 text-ink-900">{r.code} — {r.nameAr}</td>
                  <td className="py-2 text-end font-semibold text-emerald-700">{r.balance.toFixed(2)} AED</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-bold text-emerald-700">
          <span>إجمالي الإيرادات</span>
          <span>{totalIncome.toFixed(2)} AED</span>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-3 font-bold text-ink-900">المصروفات</h2>
        {expense.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد مصروفات بهذه الفترة</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-brand-100">
              {expense.map((r) => (
                <tr key={r.accountId}>
                  <td className="py-2 text-ink-900">{r.code} — {r.nameAr}</td>
                  <td className="py-2 text-end font-semibold text-red-700">{r.balance.toFixed(2)} AED</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-bold text-red-700">
          <span>إجمالي المصروفات</span>
          <span>{totalExpense.toFixed(2)} AED</span>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex justify-between text-lg font-bold text-brand-700">
          <span>صافي الدخل</span>
          <span>{netIncome.toFixed(2)} AED</span>
        </div>
      </div>
    </div>
  );
}
