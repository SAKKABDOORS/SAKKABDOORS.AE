import Link from "next/link";
import { requirePageRole } from "@/lib/requirePageRole";

const SECTIONS: { key: string; label: string; description: string }[] = [
  { key: "branding", label: "الشعار (اللوغو)", description: "شعار الموقع الظاهر في شريط التنقل" },
  { key: "hero", label: "القسم الرئيسي (أعلى الصفحة الرئيسية)", description: "العنوان، الوصف الفرعي، صورة أو فيديو الخلفية" },
  { key: "stats", label: "شريط الإحصائيات", description: "سنوات الخبرة، المشاريع، العملاء" },
  { key: "services", label: "شبكة الخدمات", description: "البطاقات الأربع (ألمنيوم/أبواب/عقارات/WPC)" },
  { key: "quality", label: "قسم الثقة", description: "الجودة، الضمان، الابتكار" },
  { key: "cta", label: "قسم الدعوة لاتخاذ إجراء", description: "قبل الفوتر مباشرة" },
  { key: "footer", label: "الفوتر", description: "الفروع، الهاتف، الإيميل" },
  { key: "about_media", label: "صور وفيديوهات صفحة من نحن", description: "معرض صور/فيديوهات إضافي بأسفل صفحة \"من نحن\"" }
];

export default async function AdminContentPage() {
  await requirePageRole("content");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">محتوى الموقع</h1>
      <p className="mb-6 text-sm text-ink-800/70">
        عدّل نصوص وأرقام الصفحة الرئيسية والفوتر مباشرة من هنا — أي تعديل ينعكس على الموقع فوراً.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/admin/content/${s.key}`}
            className="card block p-5 transition hover:shadow-md"
          >
            <div className="font-bold text-ink-900">{s.label}</div>
            <div className="mt-1 text-sm text-ink-800/60">{s.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
