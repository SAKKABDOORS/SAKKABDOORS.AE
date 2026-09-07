import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCustomerTypeButton from "@/components/DeleteCustomerTypeButton";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminCustomerTypesPage() {
  await requirePageRole("customerTypes");

  const customerTypes = await prisma.customerType.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">أنواع العملاء</h1>
          <p className="mt-1 text-sm text-ink-800/60">
            هاي القائمة يلي منها بتختار نسبة الخصم لكل سطر بعرض السعر — عدّل النسب متل ما بدك.
          </p>
        </div>
        <Link href="/admin/customer-types/new" className="btn-primary">إضافة نوع</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الاسم</th>
              <th className="p-3 text-start font-semibold">نسبة الخصم</th>
              <th className="p-3 text-start font-semibold">الحالة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {customerTypes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-800/60">
                  لا يوجد أنواع عملاء بعد
                </td>
              </tr>
            )}
            {customerTypes.map((ct) => (
              <tr key={ct.id}>
                <td className="p-3 font-medium text-ink-900">{ct.nameAr}</td>
                <td className="p-3 text-ink-800/70">{ct.discountPercent}%</td>
                <td className="p-3">
                  {ct.isActive ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">مفعّل</span>
                  ) : (
                    <span className="rounded-full bg-ink-800/10 px-2 py-1 text-xs font-semibold text-ink-800/60">معطّل</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/customer-types/${ct.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteCustomerTypeButton customerTypeId={ct.id} />
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
