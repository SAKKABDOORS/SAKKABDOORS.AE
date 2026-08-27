import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";

const MONTH_LABELS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const RESULT_CAP = 300;

export default async function AdminChatsPage({
  searchParams
}: {
  searchParams: { month?: string; year?: string };
}) {
  await requirePageRole("chats");

  const month = searchParams.month ? Number(searchParams.month) : undefined;
  const year = searchParams.year ? Number(searchParams.year) : undefined;

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (year) {
    dateFilter = month
      ? { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) }
      : { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) };
  }

  const where = dateFilter ? { createdAt: dateFilter } : undefined;

  const [logs, totalCount, earliestLog] = await Promise.all([
    prisma.chatLog.findMany({ where, orderBy: { createdAt: "desc" }, take: RESULT_CAP }),
    prisma.chatLog.count({ where }),
    prisma.chatLog.findFirst({ orderBy: { createdAt: "asc" } })
  ]);

  const currentYear = new Date().getFullYear();
  const earliestYear = earliestLog ? earliestLog.createdAt.getFullYear() : currentYear;
  const years: number[] = [];
  for (let y = currentYear; y >= earliestYear; y--) years.push(y);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">مؤخراً</h1>
      <p className="mb-6 text-sm text-ink-800/70">
        كل المحادثات مع المساعد الذكي منذ أول يوم للموقع — صفّي حسب الشهر والسنة عند الحاجة.
      </p>

      <form method="get" className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">السنة</label>
          <select name="year" defaultValue={year ?? ""} className="input">
            <option value="">كل السنوات</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">الشهر</label>
          <select name="month" defaultValue={month ?? ""} className="input">
            <option value="">كل الشهور</option>
            {MONTH_LABELS.map((label, i) => (
              <option key={i} value={i + 1}>{label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">تصفية</button>
        {(year || month) && (
          <a href="/admin/chats" className="btn-secondary">إلغاء التصفية</a>
        )}
      </form>

      <p className="mb-3 text-sm text-ink-800/60">
        {totalCount === 0
          ? "لا توجد محادثات لهذه الفترة."
          : totalCount > RESULT_CAP
            ? `${totalCount} محادثة — يظهر أحدث ${RESULT_CAP}`
            : `${totalCount} محادثة`}
      </p>

      {logs.length > 0 && (
        <div className="card divide-y divide-brand-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 text-sm">
              <div className="font-medium text-ink-900">س: {log.question}</div>
              <div className="mt-1 text-ink-800/70">ج: {log.answer}</div>
              <div className="mt-1 text-xs text-ink-800/40">
                {new Date(log.createdAt).toLocaleString("ar-AE")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
