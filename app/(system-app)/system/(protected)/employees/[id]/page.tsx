import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import EmployeePaySalaryForm from "@/components/EmployeePaySalaryForm";
import EmployeeAmountReasonForm from "@/components/EmployeeAmountReasonForm";
import EmployeeEvaluationForm from "@/components/EmployeeEvaluationForm";
import DeleteRecordButton from "@/components/DeleteRecordButton";

const SCORE_LABELS: Record<number, string> = { 5: "ممتاز", 4: "جيد جداً", 3: "جيد", 2: "مقبول", 1: "ضعيف" };

export default async function SystemEmployeeDetailPage({ params }: { params: { id: string } }) {
  await requireSystemRole("employees");

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      vouchers: { orderBy: { createdAt: "desc" } },
      deductions: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      evaluations: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!employee) notFound();

  const totalVouchers = employee.vouchers.reduce((sum, v) => sum + v.amount, 0);
  const totalDeductions = employee.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netDue = employee.monthlyWage - totalDeductions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">{employee.nameAr}</h1>
        <Link href={`/employees/${employee.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
          تعديل البيانات
        </Link>
      </div>

      <div className="card grid gap-2 p-6 sm:grid-cols-2">
        <p className="text-sm"><span className="font-bold text-brand-700">الوظيفة:</span> {employee.position ?? "—"}</p>
        <p className="text-sm"><span className="font-bold text-brand-700">الهاتف:</span> {employee.phone}</p>
        <p className="text-sm"><span className="font-bold text-brand-700">الراتب الشهري:</span> {employee.monthlyWage.toFixed(2)} AED</p>
        <p className="text-sm"><span className="font-bold text-brand-700">إجمالي الخصومات:</span> {totalDeductions.toFixed(2)} AED</p>
        <p className="text-sm font-semibold text-brand-700">الصافي المستحق هذا الشهر: {netDue.toFixed(2)} AED</p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">دفع الراتب</h2>
        <EmployeePaySalaryForm employeeId={employee.id} monthlyWage={employee.monthlyWage} />
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">سندات القبض (سلف / مكافآت)</h2>
        <EmployeeAmountReasonForm
          apiBase={`/api/system/employees/${employee.id}/vouchers`}
          reasonPlaceholder="سلفة / مكافأة"
          submitLabel="إضافة سند"
        />
        {employee.vouchers.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد سندات قبض بعد</p>
        ) : (
          <ul className="divide-y divide-brand-100 text-sm">
            {employee.vouchers.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2">
                <span>{new Date(v.createdAt).toLocaleDateString("ar-AE")} — {v.reason}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-red-700">{v.amount.toFixed(2)} AED</span>
                  <a href={`/api/system/voucher-pdf/${v.id}`} download className="btn-secondary py-1 px-2 text-xs">
                    PDF
                  </a>
                  <DeleteRecordButton apiBase="/api/system/vouchers" id={v.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-end text-sm font-semibold text-ink-900">الإجمالي: {totalVouchers.toFixed(2)} AED</p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">الخصومات</h2>
        <EmployeeAmountReasonForm
          apiBase={`/api/system/employees/${employee.id}/deductions`}
          reasonPlaceholder="سوء استخدام / إلخ"
          submitLabel="إضافة خصم"
        />
        {employee.deductions.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد خصومات بعد</p>
        ) : (
          <ul className="divide-y divide-brand-100 text-sm">
            {employee.deductions.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2">
                <span>{new Date(d.createdAt).toLocaleDateString("ar-AE")} — {d.reason}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-red-700">{d.amount.toFixed(2)} AED</span>
                  <DeleteRecordButton apiBase="/api/system/deductions" id={d.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">تقييم الموظف</h2>
        <EmployeeEvaluationForm employeeId={employee.id} />
        {employee.evaluations.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد تقييمات بعد</p>
        ) : (
          <ul className="divide-y divide-brand-100 text-sm">
            {employee.evaluations.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between py-2">
                <span>
                  {new Date(ev.createdAt).toLocaleDateString("ar-AE")} — {SCORE_LABELS[ev.score] ?? ev.score}
                  {ev.notes ? ` — ${ev.notes}` : ""}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-brand-700">{ev.score}/5</span>
                  <DeleteRecordButton apiBase="/api/system/evaluations" id={ev.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-ink-900">سجل المدفوعات لهالموظف</h2>
        {employee.payments.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد مدفوعات مسجلة بعد</p>
        ) : (
          <ul className="divide-y divide-brand-100 text-sm">
            {employee.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>{new Date(p.createdAt).toLocaleString("ar-AE")} — {p.category === "salary" ? "راتب" : p.category === "voucher" ? "سند قبض" : p.category}</span>
                <span className="font-semibold text-red-700">{p.amount.toFixed(2)} AED</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
