import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import UnblockVisitorButton from "@/components/UnblockVisitorButton";

// Only this account can actually unblock a visitor (see
// app/api/admin/blocked/[id]/route.ts) — everyone else with access to this
// page can still see the list, just not act on it.
const UNBLOCK_USERNAME = "DARKSHAM";

export default async function AdminBlockedPage() {
  const session = await requirePageRole("blocked");
  const canUnblock = session.username === UNBLOCK_USERNAME;

  const visitors = await prisma.blockedVisitor.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">الزوار المحظورين</h1>
      <p className="mb-6 text-sm text-ink-800/70">
        أي زائر يستخدم لغة غير لائقة مع المساعد الذكي بيتحظر تلقائياً (ما بيقدر ياخد رد منه مرة تانية) — الحظر مبني
        على الـ IP وعلى تعريف محفوظ بالمتصفح معاً، فتغيير الشبكة أو تشغيل VPN لحاله ما يكفي لفك الحظر.
        {canUnblock ? " فيك تلغي الحظر من هون." : ` فك الحظر متاح فقط لحساب ${UNBLOCK_USERNAME}.`}
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">IP</th>
              <th className="p-3 text-start font-semibold">آخر رسالة سببت الحظر</th>
              <th className="p-3 text-start font-semibold">تاريخ الحظر</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {visitors.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-800/60">
                  لا يوجد زوار محظورين حالياً
                </td>
              </tr>
            )}
            {visitors.map((v) => (
              <tr key={v.id}>
                <td className="p-3 font-mono text-xs text-ink-900">{v.ip}</td>
                <td className="max-w-xs truncate p-3 text-ink-800/70" title={v.reason}>
                  {v.reason}
                </td>
                <td className="p-3 text-xs text-ink-800/60">
                  {new Date(v.createdAt).toLocaleString("ar-AE")}
                </td>
                <td className="p-3">
                  {canUnblock ? (
                    <UnblockVisitorButton visitorId={v.id} />
                  ) : (
                    <span className="text-xs text-ink-800/40">محظور</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
