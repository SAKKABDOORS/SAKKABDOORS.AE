import { notFound } from "next/navigation";
import Link from "next/link";
import { SITE_SETTING_SCHEMAS, getSiteSetting, type SiteSettingKey } from "@/lib/siteContent";
import SiteSettingEditor from "@/components/admin/SiteSettingEditor";
import { requirePageRole } from "@/lib/requirePageRole";

const LABELS: Record<SiteSettingKey, string> = {
  branding: "الشعار (اللوغو)",
  hero: "القسم الرئيسي",
  stats: "شريط الإحصائيات",
  services: "شبكة الخدمات",
  quality: "قسم الثقة",
  cta: "قسم الدعوة لاتخاذ إجراء",
  footer: "الفوتر",
  about_media: "صور وفيديوهات صفحة من نحن"
};

function isSiteSettingKey(key: string): key is SiteSettingKey {
  return key in SITE_SETTING_SCHEMAS;
}

export default async function EditSiteSettingPage({ params }: { params: { key: string } }) {
  await requirePageRole("content");
  if (!isSiteSettingKey(params.key)) notFound();

  const value = await getSiteSetting(params.key);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-ink-800/60">
        <Link href="/admin/content" className="hover:text-brand-700">محتوى الموقع</Link>
        <span>/</span>
        <span className="text-ink-900">{LABELS[params.key]}</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">{LABELS[params.key]}</h1>
      <SiteSettingEditor settingKey={params.key} initialValue={value} />
    </div>
  );
}
