import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import CategoryMappingForm from "@/components/CategoryMappingForm";
import DeleteMappingButton from "@/components/DeleteMappingButton";

export default async function AccountingSettingsPage() {
  await requireAccountingRole();

  const [mappings, accounts] = await Promise.all([
    prisma.categoryAccountMapping.findMany({ include: { account: true }, orderBy: { category: "asc" } }),
    prisma.account.findMany({ where: { isActive: true }, orderBy: { code: "asc" } })
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">إعدادات الترحيل التلقائي</h1>
      <p className="text-sm text-ink-800/60">
        لما تُسجَّل دفعة بتصنيف (category) مش معروف بالنظام، بتترحّل تلقائياً لحساب "معلق" (3999) لحد ما تحدد له حساب هون.
        التصنيفات المعروفة افتراضياً: <code dir="ltr">salary</code> و<code dir="ltr">voucher</code> (بترحّل لحساب رواتب وأجور
        ما لم تحدد غيره)، و<code dir="ltr">invoice</code> (دايماً بترحّل لحسابات العملاء، ثابت).
      </p>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">إضافة ربط جديد</h2>
        <CategoryMappingForm accounts={accounts} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">التصنيف</th>
              <th className="p-3 text-start font-semibold">الحساب</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {mappings.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-ink-800/60">لا يوجد روابط مخصصة بعد</td>
              </tr>
            )}
            {mappings.map((m) => (
              <tr key={m.id}>
                <td className="p-3 font-mono text-ink-900" dir="ltr">{m.category}</td>
                <td className="p-3 text-ink-800/70">{m.account.code} — {m.account.nameAr}</td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <DeleteMappingButton mappingId={m.id} />
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
