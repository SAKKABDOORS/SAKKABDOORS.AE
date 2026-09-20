import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteEmployeeButton from "@/components/DeleteEmployeeButton";
import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function SystemEmployeesPage() {
  await requireSystemRole("employees");

  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">الموظفين</h1>
        <Link href="/employees/new" className="btn-primary">إضافة موظف</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الاسم</th>
              <th className="p-3 text-start font-semibold">الوظيفة</th>
              <th className="p-3 text-start font-semibold">الهاتف</th>
              <th className="p-3 text-start font-semibold">الراتب الشهري</th>
              <th className="p-3 text-start font-semibold">الحالة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink-800/60">
                  لا يوجد موظفين بعد
                </td>
              </tr>
            )}
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="p-3 font-medium text-ink-900">{e.nameAr}</td>
                <td className="p-3 text-ink-800/70">{e.position ?? "—"}</td>
                <td className="p-3 text-ink-800/70">{e.phone}</td>
                <td className="p-3 text-ink-800/70">{e.monthlyWage.toFixed(2)} AED</td>
                <td className="p-3">
                  {e.isActive ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">نشط</span>
                  ) : (
                    <span className="rounded-full bg-ink-800/10 px-2 py-1 text-xs font-semibold text-ink-800/60">غير نشط</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/employees/${e.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                      عرض
                    </Link>
                    <Link href={`/employees/${e.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteEmployeeButton employeeId={e.id} />
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
