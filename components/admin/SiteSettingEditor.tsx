"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IconPicker from "./IconPicker";
import ImageUploadField from "./ImageUploadField";
import PdfUploadField from "./PdfUploadField";
import AboutMediaEditor from "./AboutMediaEditor";
import type {
  AboutMediaContent,
  BrandingContent,
  CatalogsContent,
  CtaContent,
  FooterContent,
  HeroContent,
  QualityContent,
  ServicesContent,
  SiteSettingKey,
  StatsContent
} from "@/lib/siteContent";

type AnyContent =
  | BrandingContent
  | HeroContent
  | StatsContent
  | ServicesContent
  | QualityContent
  | CtaContent
  | FooterContent
  | AboutMediaContent
  | CatalogsContent;

function BilingualInput({
  label,
  ar,
  en,
  onChangeAr,
  onChangeEn,
  multiline = false
}: {
  label: string;
  ar: string;
  en: string;
  onChangeAr: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
}) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">{label} (عربي)</label>
        <Field className="input" value={ar} onChange={(e) => onChangeAr(e.target.value)} rows={multiline ? 3 : undefined} />
      </div>
      <div>
        <label className="label">{label} (English)</label>
        <Field className="input" value={en} onChange={(e) => onChangeEn(e.target.value)} rows={multiline ? 3 : undefined} />
      </div>
    </div>
  );
}

export default function SiteSettingEditor({
  settingKey,
  initialValue
}: {
  settingKey: SiteSettingKey;
  initialValue: AnyContent;
}) {
  const router = useRouter();
  const [value, setValue] = useState<AnyContent>(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch(`/api/site-settings/${settingKey}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value)
    });
    setSaving(false);
    if (!res.ok) {
      setError("تعذر الحفظ. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="card space-y-6 p-6">
      {settingKey === "branding" && <BrandingEditor value={value as BrandingContent} onChange={setValue} />}
      {settingKey === "hero" && <HeroEditor value={value as HeroContent} onChange={setValue} />}
      {settingKey === "stats" && <StatsEditor value={value as StatsContent} onChange={setValue} />}
      {settingKey === "services" && <ServicesEditor value={value as ServicesContent} onChange={setValue} />}
      {settingKey === "quality" && <QualityEditor value={value as QualityContent} onChange={setValue} />}
      {settingKey === "cta" && <CtaEditor value={value as CtaContent} onChange={setValue} />}
      {settingKey === "footer" && <FooterEditor value={value as FooterContent} onChange={setValue} />}
      {settingKey === "about_media" && <AboutMediaEditor value={value as AboutMediaContent} onChange={setValue} />}
      {settingKey === "catalogs" && <CatalogsEditor value={value as CatalogsContent} onChange={setValue} />}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-600">تم الحفظ بنجاح.</p>}

      <button type="button" disabled={saving} onClick={handleSave} className="btn-primary">
        {saving ? "جاري الحفظ..." : "حفظ"}
      </button>
    </div>
  );
}

function HeroEditor({ value, onChange }: { value: HeroContent; onChange: (v: HeroContent) => void }) {
  return (
    <div className="space-y-4">
      <BilingualInput
        label="العنوان"
        ar={value.ar.title}
        en={value.en.title}
        onChangeAr={(v) => onChange({ ...value, ar: { ...value.ar, title: v } })}
        onChangeEn={(v) => onChange({ ...value, en: { ...value.en, title: v } })}
      />
      <BilingualInput
        label="الوصف الفرعي"
        ar={value.ar.subtitle}
        en={value.en.subtitle}
        onChangeAr={(v) => onChange({ ...value, ar: { ...value.ar, subtitle: v } })}
        onChangeEn={(v) => onChange({ ...value, en: { ...value.en, subtitle: v } })}
        multiline
      />
      <div>
        <label className="label">نوع خلفية القسم الرئيسي</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...value, backgroundType: "image" })}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              value.backgroundType === "image"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-100 bg-white text-ink-800"
            }`}
          >
            صورة
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, backgroundType: "video" })}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              value.backgroundType === "video"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-100 bg-white text-ink-800"
            }`}
          >
            فيديو
          </button>
        </div>
      </div>

      <ImageUploadField
        label={value.backgroundType === "video" ? "صورة احتياطية (poster) — تظهر إلى أن يتم تحميل الفيديو" : "صورة الخلفية"}
        value={value.backgroundImage}
        onChange={(url) => onChange({ ...value, backgroundImage: url })}
      />

      {value.backgroundType === "video" && (
        <div>
          <label className="label">رابط الفيديو (رابط يوتيوب أو رابط MP4 مباشر)</label>
          <input
            className="input"
            dir="ltr"
            placeholder="https://youtube.com/watch?v=... أو https://.../video.mp4"
            value={value.backgroundVideo ?? ""}
            onChange={(e) => onChange({ ...value, backgroundVideo: e.target.value })}
          />
          <p className="mt-1 text-xs text-ink-800/60">
            يعمل الفيديو تلقائياً بدون صوت ويتكرر باستمرار. إذا لم يكن لديك رابط تخزين مباشر للفيديو، الصق رابط يوتيوب عادي وسيعمل تلقائياً. رفع فيديو مباشر (upload) غير مدعوم حالياً.
          </p>
        </div>
      )}
    </div>
  );
}

function BrandingEditor({ value, onChange }: { value: BrandingContent; onChange: (v: BrandingContent) => void }) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="شعار الموقع (اللوغو)"
        value={value.logoUrl}
        onChange={(url) => onChange({ ...value, logoUrl: url })}
      />
      <ImageUploadField
        label="صورة شعارات مجموعة سكاب (بالصفحة الرئيسية)"
        value={value.groupImage}
        onChange={(url) => onChange({ ...value, groupImage: url })}
      />
    </div>
  );
}

function StatsEditor({ value, onChange }: { value: StatsContent; onChange: (v: StatsContent) => void }) {
  return (
    <div className="space-y-6">
      <BilingualInput
        label="العنوان"
        ar={value.heading.ar}
        en={value.heading.en}
        onChangeAr={(v) => onChange({ ...value, heading: { ...value.heading, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, heading: { ...value.heading, en: v } })}
      />
      {value.items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-brand-100 p-4">
          <div className="text-sm font-semibold text-ink-800/70">إحصائية {i + 1}</div>
          <IconPicker
            value={item.icon as never}
            onChange={(icon) => {
              const items = [...value.items];
              items[i] = { ...items[i], icon };
              onChange({ ...value, items: items as StatsContent["items"] });
            }}
          />
          <div>
            <label className="label">القيمة (مثال: 15+)</label>
            <input
              className="input"
              value={item.value}
              onChange={(e) => {
                const items = [...value.items];
                items[i] = { ...items[i], value: e.target.value };
                onChange({ ...value, items: items as StatsContent["items"] });
              }}
            />
          </div>
          <BilingualInput
            label="التسمية"
            ar={item.label.ar}
            en={item.label.en}
            onChangeAr={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], label: { ...items[i].label, ar: v } };
              onChange({ ...value, items: items as StatsContent["items"] });
            }}
            onChangeEn={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], label: { ...items[i].label, en: v } };
              onChange({ ...value, items: items as StatsContent["items"] });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ServicesEditor({ value, onChange }: { value: ServicesContent; onChange: (v: ServicesContent) => void }) {
  return (
    <div className="space-y-6">
      <BilingualInput
        label="العنوان الفرعي (Eyebrow)"
        ar={value.eyebrow.ar}
        en={value.eyebrow.en}
        onChangeAr={(v) => onChange({ ...value, eyebrow: { ...value.eyebrow, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, eyebrow: { ...value.eyebrow, en: v } })}
      />
      <BilingualInput
        label="العنوان"
        ar={value.heading.ar}
        en={value.heading.en}
        onChangeAr={(v) => onChange({ ...value, heading: { ...value.heading, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, heading: { ...value.heading, en: v } })}
      />
      {value.items.map((item, i) => (
        <div key={item.key} className="space-y-3 rounded-lg border border-brand-100 p-4">
          <div className="text-sm font-semibold text-ink-800/70">خدمة: {item.key}</div>
          <ImageUploadField
            label="الصورة"
            value={item.image}
            onChange={(url) => {
              const items = [...value.items];
              items[i] = { ...items[i], image: url };
              onChange({ ...value, items: items as ServicesContent["items"] });
            }}
          />
          <BilingualInput
            label="التسمية"
            ar={item.label.ar}
            en={item.label.en}
            onChangeAr={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], label: { ...items[i].label, ar: v } };
              onChange({ ...value, items: items as ServicesContent["items"] });
            }}
            onChangeEn={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], label: { ...items[i].label, en: v } };
              onChange({ ...value, items: items as ServicesContent["items"] });
            }}
          />
          <div>
            <label className="label">الرابط (مثال: /products)</label>
            <input
              className="input"
              value={item.href}
              onChange={(e) => {
                const items = [...value.items];
                items[i] = { ...items[i], href: e.target.value };
                onChange({ ...value, items: items as ServicesContent["items"] });
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function QualityEditor({ value, onChange }: { value: QualityContent; onChange: (v: QualityContent) => void }) {
  return (
    <div className="space-y-6">
      <BilingualInput
        label="العنوان الفرعي (Eyebrow)"
        ar={value.eyebrow.ar}
        en={value.eyebrow.en}
        onChangeAr={(v) => onChange({ ...value, eyebrow: { ...value.eyebrow, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, eyebrow: { ...value.eyebrow, en: v } })}
      />
      {value.items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-brand-100 p-4">
          <div className="text-sm font-semibold text-ink-800/70">ميزة {i + 1}</div>
          <IconPicker
            value={item.icon as never}
            onChange={(icon) => {
              const items = [...value.items];
              items[i] = { ...items[i], icon };
              onChange({ ...value, items: items as QualityContent["items"] });
            }}
          />
          <BilingualInput
            label="العنوان"
            ar={item.title.ar}
            en={item.title.en}
            onChangeAr={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], title: { ...items[i].title, ar: v } };
              onChange({ ...value, items: items as QualityContent["items"] });
            }}
            onChangeEn={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], title: { ...items[i].title, en: v } };
              onChange({ ...value, items: items as QualityContent["items"] });
            }}
          />
          <BilingualInput
            label="الوصف"
            ar={item.body.ar}
            en={item.body.en}
            onChangeAr={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], body: { ...items[i].body, ar: v } };
              onChange({ ...value, items: items as QualityContent["items"] });
            }}
            onChangeEn={(v) => {
              const items = [...value.items];
              items[i] = { ...items[i], body: { ...items[i].body, en: v } };
              onChange({ ...value, items: items as QualityContent["items"] });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function CtaEditor({ value, onChange }: { value: CtaContent; onChange: (v: CtaContent) => void }) {
  return (
    <div className="space-y-4">
      <BilingualInput
        label="العنوان"
        ar={value.title.ar}
        en={value.title.en}
        onChangeAr={(v) => onChange({ ...value, title: { ...value.title, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, title: { ...value.title, en: v } })}
      />
      <BilingualInput
        label="الوصف الفرعي"
        ar={value.subtitle.ar}
        en={value.subtitle.en}
        onChangeAr={(v) => onChange({ ...value, subtitle: { ...value.subtitle, ar: v } })}
        onChangeEn={(v) => onChange({ ...value, subtitle: { ...value.subtitle, en: v } })}
      />
    </div>
  );
}

const SOCIAL_LABELS: Record<"facebook" | "instagram" | "youtube" | "linkedin" | "tiktok" | "twitter", string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  youtube: "يوتيوب",
  linkedin: "لينكد إن",
  tiktok: "تيك توك",
  twitter: "X (تويتر)"
};

function FooterEditor({ value, onChange }: { value: FooterContent; onChange: (v: FooterContent) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="label">البريد الإلكتروني</label>
        <input className="input" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </div>

      <div className="space-y-3 rounded-lg border border-brand-100 p-4">
        <div className="text-sm font-semibold text-ink-800/70">روابط التواصل الاجتماعي (اتركها فاضية لإخفاء الأيقونة)</div>
        {(["facebook", "instagram", "youtube", "linkedin", "tiktok", "twitter"] as const).map((key) => (
          <div key={key}>
            <label className="label">{SOCIAL_LABELS[key]}</label>
            <input
              className="input"
              dir="ltr"
              placeholder="https://..."
              value={value.social[key]}
              onChange={(e) => onChange({ ...value, social: { ...value.social, [key]: e.target.value } })}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-brand-100 p-4">
        <div className="text-sm font-semibold text-ink-800/70">الدعم الفني (عطل بالموقع — منفصل عن فروع المبيعات، اترك الرقم فاضي لإخفائه)</div>
        <div>
          <label className="label">الاسم</label>
          <input
            className="input"
            value={value.techSupport.name}
            onChange={(e) => onChange({ ...value, techSupport: { ...value.techSupport, name: e.target.value } })}
          />
        </div>
        <div>
          <label className="label">رقم الهاتف (بدون +)</label>
          <input
            className="input"
            dir="ltr"
            value={value.techSupport.phone}
            onChange={(e) => onChange({ ...value, techSupport: { ...value.techSupport, phone: e.target.value } })}
          />
        </div>
      </div>

      {value.locations.map((loc, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-brand-100 p-4">
          <div className="text-sm font-semibold text-ink-800/70">فرع {i + 1}</div>
          <IconPicker
            value={loc.icon as never}
            onChange={(icon) => {
              const locations = [...value.locations];
              locations[i] = { ...locations[i], icon };
              onChange({ ...value, locations: locations as FooterContent["locations"] });
            }}
          />
          <BilingualInput
            label="الاسم"
            ar={loc.name.ar}
            en={loc.name.en}
            onChangeAr={(v) => {
              const locations = [...value.locations];
              locations[i] = { ...locations[i], name: { ...locations[i].name, ar: v } };
              onChange({ ...value, locations: locations as FooterContent["locations"] });
            }}
            onChangeEn={(v) => {
              const locations = [...value.locations];
              locations[i] = { ...locations[i], name: { ...locations[i].name, en: v } };
              onChange({ ...value, locations: locations as FooterContent["locations"] });
            }}
          />
          <BilingualInput
            label="العنوان"
            ar={loc.address.ar}
            en={loc.address.en}
            onChangeAr={(v) => {
              const locations = [...value.locations];
              locations[i] = { ...locations[i], address: { ...locations[i].address, ar: v } };
              onChange({ ...value, locations: locations as FooterContent["locations"] });
            }}
            onChangeEn={(v) => {
              const locations = [...value.locations];
              locations[i] = { ...locations[i], address: { ...locations[i].address, en: v } };
              onChange({ ...value, locations: locations as FooterContent["locations"] });
            }}
          />
          <div>
            <label className="label">رقم الهاتف (بدون +)</label>
            <input
              className="input"
              dir="ltr"
              value={loc.phone}
              onChange={(e) => {
                const locations = [...value.locations];
                locations[i] = { ...locations[i], phone: e.target.value };
                onChange({ ...value, locations: locations as FooterContent["locations"] });
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const CATALOG_SECTION_LABELS: Record<keyof CatalogsContent, string> = {
  wpc: "كتالوج WPC",
  aluminum: "كتالوج الألمنيوم",
  composite: "كتالوج COMPOSITE",
  realestate: "كتالوج العقارات"
};

function CatalogsEditor({ value, onChange }: { value: CatalogsContent; onChange: (v: CatalogsContent) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-800/60">
        ملف PDF جاهز ترفعه انت (مش الكتالوج التلقائي المبني من المنتجات) — بيظهر كزر تحميل بصفحة القسم
        المطابق للزوار. اتركه فاضي لإخفاء الزر. الحد الأقصى 4MB لكل ملف.
      </p>
      {(Object.keys(CATALOG_SECTION_LABELS) as (keyof CatalogsContent)[]).map((key) => (
        <PdfUploadField
          key={key}
          label={CATALOG_SECTION_LABELS[key]}
          value={value[key]}
          onChange={(url) => onChange({ ...value, [key]: url })}
        />
      ))}
    </div>
  );
}
