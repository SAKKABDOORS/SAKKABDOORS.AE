import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import SystemSearchBar from "@/components/SystemSearchBar";

const ACTION_LABELS: Record<string, string> = { create: "إضافة", update: "تعديل", delete: "حذف" };
const ACTION_BADGE_CLASS: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-amber-50 text-amber-700",
  delete: "bg-red-50 text-red-700"
};

export default async function SystemAuditLogPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireSystemRole("auditLog");

  const q = searchParams.q?.trim();

  const entries = await prisma.auditLog.findMany({
    where: q
      ? { OR: [{ actorEmail: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">سجل التدقيق</h1>
      <p className="mb-4 text-sm text-ink-800/60">
        آخر 200 عملية إضافة/تعديل/حذف تمت من النظام — من عملها ومتى.
      </p>

      <SystemSearchBar action="/audit-log" q={q} placeholder="البريد الإلكتروني أو نص العملية" />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">التاريخ</th>
              <th className="p-3 text-start font-semibold">المستخدم</th>
              <th className="p-3 text-start font-semibold">العملية</th>
              <th className="p-3 text-start font-semibold">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-800/60">
                  {q ? "ما في نتائج مطابقة للبحث" : "لا يوجد عمليات مسجلة بعد"}
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap p-3 text-ink-800/70">{new Date(entry.createdAt).toLocaleString("ar-AE")}</td>
                <td className="p-3 text-ink-800/70">{entry.actorEmail}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${ACTION_BADGE_CLASS[entry.action] ?? "bg-ink-800/10 text-ink-800/60"}`}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                </td>
                <td className="p-3 text-ink-900">{entry.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
