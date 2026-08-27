"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";
import ImageUploadField from "./admin/ImageUploadField";
import { describeApiError } from "@/lib/adminFormError";

const FIELD_LABELS: Record<string, string> = {
  nameAr: "الاسم (عربي)",
  nameEn: "Name (English)",
  taglineAr: "الشعار الفرعي (عربي)",
  taglineEn: "Tagline (English)",
  descriptionAr: "الوصف (عربي)",
  descriptionEn: "Description (English)",
  heroImage: "الصورة الرئيسية"
};

export default function CategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const [heroImage, setHeroImage] = useState(category.heroImage ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      nameAr: String(form.get("nameAr") || "").trim(),
      nameEn: String(form.get("nameEn") || "").trim(),
      taglineAr: String(form.get("taglineAr") || "").trim(),
      taglineEn: String(form.get("taglineEn") || "").trim(),
      descriptionAr: String(form.get("descriptionAr") || "").trim(),
      descriptionEn: String(form.get("descriptionEn") || "").trim(),
      heroImage: heroImage.trim()
    };

    const res = await fetch(`/api/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const specific = describeApiError(data, FIELD_LABELS);
      setError(specific ?? "تعذر حفظ الفئة. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={category.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English)</label>
          <input className="input" name="nameEn" defaultValue={category.nameEn} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الشعار الفرعي (عربي)</label>
          <input className="input" name="taglineAr" defaultValue={category.taglineAr ?? ""} />
        </div>
        <div>
          <label className="label">Tagline (English)</label>
          <input className="input" name="taglineEn" defaultValue={category.taglineEn ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الوصف (عربي) — يظهر بقسم Spotlight بالرئيسية</label>
          <textarea className="input" name="descriptionAr" rows={4} defaultValue={category.descriptionAr ?? ""} />
        </div>
        <div>
          <label className="label">Description (English)</label>
          <textarea className="input" name="descriptionEn" rows={4} defaultValue={category.descriptionEn ?? ""} />
        </div>
      </div>

      <ImageUploadField label="الصورة الرئيسية (Spotlight)" value={heroImage} onChange={setHeroImage} />

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
