import { prisma } from "@/lib/prisma";
import KnowledgeManager from "@/components/KnowledgeManager";
import { requirePageRole } from "@/lib/requirePageRole";
import { isAiEnabled } from "@/lib/ai";

export default async function AdminAiPage() {
  await requirePageRole("ai");

  const [entries, chatLogs] = await Promise.all([
    prisma.knowledgeEntry.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.chatLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  const serializedEntries = entries.map((e) => ({
    ...e,
    updatedAt: e.updatedAt.toISOString()
  }));

  const aiEnabled = await isAiEnabled();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">الذكاء الاصطناعي</h1>
      <p className="mb-6 text-sm text-ink-800/70">
        من هنا يمكنك تدريب قاعدة معرفة المساعد الذكي الذي يظهر في زاوية الموقع للزوار. يُجيب المساعد فقط
        من المعلومات التي تضيفها هنا، إضافة إلى كتالوج المنتجات الحالي — ولا يختلق معلومات من تلقاء نفسه.
      </p>

      {!aiEnabled && (
        <div className="mb-6 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ المساعد الذكي غير مفعّل حالياً. لتفعيله، املأ قيمة <code>AI_PROVIDER</code> ومفتاح الـ API المناسب
          (<code>ANTHROPIC_API_KEY</code> أو <code>OPENAI_API_KEY</code> أو <code>GEMINI_API_KEY</code>) بملف <code>.env</code> على السيرفر.
        </div>
      )}

      <KnowledgeManager initialEntries={serializedEntries} />

      <div className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-ink-900">آخر أسئلة الزوار</h2>
        <p className="mb-3 text-sm text-ink-800/60">
          راجع هذه الأسئلة الحقيقية بشكل دوري — إذا وجدت سؤالاً متكرراً لا توجد إجابة واضحة عليه، أضفه كمعلومة جديدة في النموذج أعلاه.
        </p>
        {chatLogs.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا توجد أسئلة بعد.</p>
        ) : (
          <div className="card divide-y divide-brand-100">
            {chatLogs.map((log) => (
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
    </div>
  );
}
