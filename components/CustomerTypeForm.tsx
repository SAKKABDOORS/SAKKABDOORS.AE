"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerType } from "@prisma/client";

export default function CustomerTypeForm({ customerType }: { customerType?: CustomerType }) {
  const router = useRouter();
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
      discountPercent: Number(form.get("discountPercent") || 0),
      isActive: form.get("isActive") === "on"
    };

    const url = customerType ? `/api/admin/customer-types/${customerType.id}` : "/api/admin/customer-types";
    const method = customerType ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ نوع الزبون. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/customer-types");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={customerType?.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English)</label>
          <input className="input" name="nameEn" defaultValue={customerType?.nameEn} required />
        </div>
      </div>

      <div>
        <label className="label">نسبة الخصم (%)</label>
        <input
          className="input"
          type="number"
          step="0.1"
          min="0"
          max="100"
          name="discountPercent"
          defaultValue={customerType?.discountPercent ?? 0}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={customerType?.isActive ?? true} />
        مفعّل (يظهر بقائمة الاختيار عند إنشاء عرض سعر)
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
