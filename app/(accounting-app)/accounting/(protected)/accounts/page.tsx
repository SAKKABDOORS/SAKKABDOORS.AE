import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import { ACCOUNT_TYPE_LABELS } from "@/lib/accounts";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import SeedStarterChartButton from "@/components/SeedStarterChartButton";

export default async function AccountingAccountsPage() {
  await requireAccountingRole();

  const accounts = await prisma.account.findMany({
    orderBy: { code: "asc" },
    include: { parent: true, _count: { select: { lines: true } } }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">دليل الحسابات</h1>
        <div className="flex gap-2">
          {accounts.length === 0 && <SeedStarterChartButton />}
          <Link href="/accounts/new" className="btn-primary">إضافة حساب</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الرمز</th>
              <th className="p-3 text-start font-semibold">الاسم</th>
              <th className="p-3 text-start font-semibold">النوع</th>
              <th className="p-3 text-start font-semibold">الحساب الأب</th>
              <th className="p-3 text-start font-semibold">الحالة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-800/60">
                  لا يوجد حسابات بعد — حمّل دليل الحسابات الافتراضي أو أضف حساب يدوياً
                </td>
              </tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id}>
                <td className="p-3 font-mono text-ink-900">{a.code}</td>
                <td className="p-3 font-medium text-ink-900">{a.nameAr}</td>
                <td className="p-3 text-ink-800/70">{ACCOUNT_TYPE_LABELS[a.type]}</td>
                <td className="p-3 text-ink-800/70">{a.parent ? `${a.parent.code} — ${a.parent.nameAr}` : "—"}</td>
                <td className="p-3">
                  {a.isActive ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">مفعّل</span>
                  ) : (
                    <span className="rounded-full bg-ink-800/10 px-2 py-1 text-xs font-semibold text-ink-800/60">موقوف</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/accounts/${a.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteAccountButton accountId={a.id} hasLines={a._count.lines > 0} />
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
