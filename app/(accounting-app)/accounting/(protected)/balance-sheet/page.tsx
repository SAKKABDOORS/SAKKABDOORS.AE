import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { getAccountBalances, type AccountBalance } from "@/lib/accountingReports";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function Section({ title, rows, total }: { title: string; rows: AccountBalance[]; total: number }) {
  return (
    <div className="card p-6">
      <h2 className="mb-3 font-bold text-ink-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink-800/60">لا يوجد أرصدة</p>
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-brand-100">
            {rows.map((r) => (
              <tr key={r.accountId}>
                <td className="py-2 text-ink-900">{r.code} — {r.nameAr}</td>
                <td className="py-2 text-end font-semibold text-ink-900">{r.balance.toFixed(2)} AED</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-bold text-brand-700">
        <span>الإجمالي</span>
        <span>{total.toFixed(2)} AED</span>
      </div>
    </div>
  );
}

export default async function BalanceSheetPage({ searchParams }: { searchParams: { asOf?: string } }) {
  await requireAccountingRole();

  const asOf = searchParams.asOf ? new Date(searchParams.asOf) : new Date();

  const [assets, liabilities, equity, incomeExpense] = await Promise.all([
    getAccountBalances({ asOf, types: ["ASSET"], includeZero: false }),
    getAccountBalances({ asOf, types: ["LIABILITY"], includeZero: false }),
    getAccountBalances({ asOf, types: ["EQUITY"], includeZero: false }),
    getAccountBalances({ asOf, types: ["INCOME", "EXPENSE"] })
  ]);

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalEquityAccounts = equity.reduce((sum, a) => sum + a.balance, 0);

  const totalIncome = incomeExpense.filter((a) => a.type === "INCOME").reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = incomeExpense.filter((a) => a.type === "EXPENSE").reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalIncome - totalExpense;

  const totalEquity = totalEquityAccounts + netIncome;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.005;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">الميزانية العمومية</h1>

      <form method="GET" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">كما في تاريخ</label>
          <input className="input" type="date" name="asOf" defaultValue={toDateInputValue(asOf)} />
        </div>
        <button type="submit" className="btn-secondary py-2 px-4 text-sm">عرض</button>
      </form>

      {!balanced && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          تنبيه: الميزانية غير متوازنة — الأصول لا تساوي الالتزامات + حقوق الملكية.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="الأصول" rows={assets} total={totalAssets} />
        <div className="space-y-6">
          <Section title="الالتزامات" rows={liabilities} total={totalLiabilities} />
          <div className="card p-6">
            <h2 className="mb-3 font-bold text-ink-900">حقوق الملكية</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-brand-100">
                {equity.map((r) => (
                  <tr key={r.accountId}>
                    <td className="py-2 text-ink-900">{r.code} — {r.nameAr}</td>
                    <td className="py-2 text-end font-semibold text-ink-900">{r.balance.toFixed(2)} AED</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-ink-900">صافي الدخل حتى تاريخه</td>
                  <td className="py-2 text-end font-semibold text-ink-900">{netIncome.toFixed(2)} AED</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-bold text-brand-700">
              <span>الإجمالي</span>
              <span>{totalEquity.toFixed(2)} AED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex justify-between text-sm">
          <span className="font-bold text-ink-900">إجمالي الأصول</span>
          <span className="font-bold text-ink-900">{totalAssets.toFixed(2)} AED</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="font-bold text-ink-900">إجمالي الالتزامات + حقوق الملكية</span>
          <span className="font-bold text-ink-900">{totalLiabilitiesAndEquity.toFixed(2)} AED</span>
        </div>
      </div>
    </div>
  );
}
