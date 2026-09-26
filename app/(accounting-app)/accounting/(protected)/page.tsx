import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";

export default async function AccountingDashboardPage() {
  await requireAccountingRole();

  const accountCount = await prisma.account.count();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">المحاسبة</h1>

      <div className="card p-6">
        <p className="text-sm text-ink-800/60">عدد الحسابات بدليل الحسابات</p>
        <p className="mt-1 text-2xl font-bold text-brand-700">{accountCount}</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-2 font-bold text-ink-900">دليل الحسابات</h2>
        <p className="mb-4 text-sm text-ink-800/60">
          كل الحسابات (أصول، التزامات، حقوق ملكية، إيرادات، مصروفات) يلي بتنبني عليها القيود اليومية والتقارير.
        </p>
        <Link href="/accounts" className="btn-primary">
          فتح دليل الحسابات
        </Link>
      </div>
    </div>
  );
}
