"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InventoryMovementForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      type,
      quantity: Number(data.get("quantity") || 0),
      note: String(data.get("note") || "").trim() || undefined
    };

    const res = await fetch(`/api/system/warehouse/${productId}/movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر تسجيل الحركة.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">نوع الحركة</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="IN">إدخال (توريد)</option>
          <option value="OUT">إخراج (بيع/استخدام)</option>
          <option value="ADJUSTMENT">تصحيح (تحديد الكمية الفعلية)</option>
        </select>
      </div>
      <div>
        <label className="label">{type === "ADJUSTMENT" ? "الكمية الفعلية" : "الكمية"}</label>
        <input className="input" type="number" min={type === "ADJUSTMENT" ? 0 : 1} name="quantity" required />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">ملاحظة (اختياري)</label>
        <input className="input" name="note" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "..." : "تسجيل"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
