"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Material, ProductWithRelations } from "@/lib/types";
import MediaGalleryField, { type MediaItem } from "./admin/MediaGalleryField";
import { describeApiError } from "@/lib/adminFormError";
import { MATERIAL_PRODUCT_LINES, PRODUCT_LINE_LABELS, type ProductLine } from "@/lib/productLines";

const FIELD_LABELS: Record<string, string> = {
  slug: "الرابط المختصر",
  nameAr: "الاسم (عربي)",
  nameEn: "Name (English)",
  descriptionAr: "الوصف (عربي)",
  descriptionEn: "Description (English)",
  categoryId: "الفئة",
  material: "الخامة",
  productLine: "خط الإنتاج",
  price: "السعر",
  currency: "العملة",
  images: "صور/فيديوهات المنتج"
};

const MATERIALS: Material[] = ["WPC", "UPVC", "ALUMINUM", "STEEL"];
// Display label only — the stored/submitted value stays the real enum
// value ("UPVC") so existing products, filters, and URLs keep working.
const MATERIAL_LABELS: Record<Material, string> = {
  WPC: "WPC",
  UPVC: "COMPOSITE",
  ALUMINUM: "ألمنيوم",
  STEEL: "حديد"
};

export default function ProductForm({ product }: { product?: ProductWithRelations }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<MediaItem[]>(
    product?.images.map((i) => ({ url: i.url, type: i.type === "VIDEO" ? "video" : "image" })) ?? []
  );
  const [material, setMaterial] = useState<Material>(product?.material ?? "WPC");
  const [productLine, setProductLine] = useState<ProductLine | "">(
    (product?.productLine as ProductLine | null) ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const availableLines = MATERIAL_PRODUCT_LINES[material] ?? [];

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setError("تعذر تحميل الفئات"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      slug: String(form.get("slug") || "").trim(),
      nameAr: String(form.get("nameAr") || "").trim(),
      nameEn: String(form.get("nameEn") || "").trim(),
      descriptionAr: String(form.get("descriptionAr") || "").trim(),
      descriptionEn: String(form.get("descriptionEn") || "").trim(),
      categoryId: String(form.get("categoryId") || ""),
      material,
      productLine: availableLines.includes(productLine as ProductLine) ? productLine : null,
      price: Number(form.get("price") || 0),
      currency: String(form.get("currency") || "AED"),
      inStock: form.get("inStock") === "on",
      featured: form.get("featured") === "on",
      images: images.map((img) => ({ url: img.url, type: img.type === "video" ? "VIDEO" : "IMAGE" }))
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const specific = describeApiError(data, FIELD_LABELS);
      setError(specific ?? "تعذر حفظ المنتج. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={product?.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English)</label>
          <input className="input" name="nameEn" defaultValue={product?.nameEn} required />
        </div>
      </div>

      <div>
        <label className="label">الرابط المختصر (slug) — أحرف إنجليزية وشرطات فقط</label>
        <input className="input" name="slug" defaultValue={product?.slug} pattern="[a-z0-9\-]+" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الوصف (عربي)</label>
          <textarea className="input" name="descriptionAr" rows={4} defaultValue={product?.descriptionAr} required />
        </div>
        <div>
          <label className="label">Description (English)</label>
          <textarea className="input" name="descriptionEn" rows={4} defaultValue={product?.descriptionEn} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">الفئة</label>
          <select className="input" name="categoryId" defaultValue={product?.categoryId} required>
            <option value="" disabled>اختر فئة</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">الخامة</label>
          <select
            className="input"
            value={material}
            onChange={(e) => {
              const next = e.target.value as Material;
              setMaterial(next);
              if (!(MATERIAL_PRODUCT_LINES[next] ?? []).includes(productLine as ProductLine)) {
                setProductLine("");
              }
            }}
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">العملة</label>
          <input className="input" name="currency" defaultValue={product?.currency ?? "AED"} />
        </div>
      </div>

      {availableLines.length > 0 && (
        <div>
          <label className="label">خط الإنتاج (اختياري)</label>
          <select
            className="input"
            value={productLine}
            onChange={(e) => setProductLine(e.target.value as ProductLine | "")}
          >
            <option value="">بدون تحديد</option>
            {availableLines.map((line) => (
              <option key={line} value={line}>{PRODUCT_LINE_LABELS[line].ar}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">السعر</label>
        <input className="input" type="number" step="0.01" name="price" defaultValue={product?.price} required />
      </div>

      <MediaGalleryField
        imagesLabel="صور المنتج"
        videosLabel="فيديوهات المنتج (رابط يوتيوب أو رابط MP4 مباشر)"
        items={images}
        onChange={setImages}
      />

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} />
          متوفر
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          منتج مميز
        </label>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
