"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertyWithRelations } from "@/lib/types";
import MultiImageUploadField from "./admin/MultiImageUploadField";
import { describeApiError } from "@/lib/adminFormError";

const FIELD_LABELS: Record<string, string> = {
  slug: "الرابط المختصر",
  titleAr: "العنوان (عربي)",
  titleEn: "Title (English)",
  descriptionAr: "الوصف (عربي)",
  descriptionEn: "Description (English)",
  regionAr: "المنطقة (عربي)",
  regionEn: "Region (English)",
  price: "السعر",
  currency: "العملة",
  images: "صور العقار"
};

export default function PropertyForm({ property }: { property?: PropertyWithRelations }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(property?.images.map((i) => i.url) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      slug: String(form.get("slug") || "").trim(),
      titleAr: String(form.get("titleAr") || "").trim(),
      titleEn: String(form.get("titleEn") || "").trim(),
      descriptionAr: String(form.get("descriptionAr") || "").trim(),
      descriptionEn: String(form.get("descriptionEn") || "").trim(),
      regionAr: String(form.get("regionAr") || "").trim(),
      regionEn: String(form.get("regionEn") || "").trim(),
      price: Number(form.get("price") || 0),
      currency: String(form.get("currency") || "AED"),
      images
    };

    const url = property ? `/api/properties/${property.id}` : "/api/properties";
    const method = property ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const specific = describeApiError(data, FIELD_LABELS);
      setError(specific ?? "تعذر حفظ العقار. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/properties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">العنوان (عربي)</label>
          <input className="input" name="titleAr" defaultValue={property?.titleAr} required />
        </div>
        <div>
          <label className="label">Title (English)</label>
          <input className="input" name="titleEn" defaultValue={property?.titleEn} required />
        </div>
      </div>

      <div>
        <label className="label">الرابط المختصر (slug) — أحرف إنجليزية وشرطات فقط</label>
        <input className="input" name="slug" defaultValue={property?.slug} pattern="[a-z0-9\-]+" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الوصف (عربي)</label>
          <textarea className="input" name="descriptionAr" rows={4} defaultValue={property?.descriptionAr} required />
        </div>
        <div>
          <label className="label">Description (English)</label>
          <textarea className="input" name="descriptionEn" rows={4} defaultValue={property?.descriptionEn} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">المنطقة (عربي)</label>
          <input className="input" name="regionAr" defaultValue={property?.regionAr} placeholder="مثال: الشارقة - الياسمين" required />
        </div>
        <div>
          <label className="label">Region (English)</label>
          <input className="input" name="regionEn" defaultValue={property?.regionEn} placeholder="e.g. Sharjah - Al Yasmeen" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">السعر</label>
          <input className="input" type="number" step="0.01" name="price" defaultValue={property?.price} required />
        </div>
        <div>
          <label className="label">العملة</label>
          <input className="input" name="currency" defaultValue={property?.currency ?? "AED"} />
        </div>
      </div>

      <MultiImageUploadField label="صور العقار" values={images} onChange={setImages} />

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
