"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualPaymentForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      type: String(data.get("type") || "EXPENSE"),
      category: String(data.get("category") || "").trim(),
      amount: Number(data.get("amount") || 0),
      method: String(data.get("method") || "").trim() || undefined,
      note: String(data.get("note") || "").trim() || undefined
    };

    const res = await fetch("/api/system/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر تسجيل الحركة. تحقق من الحقول.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-bold text-ink-900">تسجيل حركة مالية يدوية</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="label">النوع</label>
          <select className="input" name="type" defaultValue="EXPENSE">
            <option value="INCOME">دخل</option>
            <option value="EXPENSE">مصروف</option>
          </select>
        </div>
        <div>
          <label className="label">التصنيف</label>
          <input className="input" name="category" placeholder="إيجار، كهرباء، إلخ" required />
        </div>
        <div>
          <label className="label">المبلغ</label>
          <input className="input" type="number" step="0.01" min="0.01" name="amount" required />
        </div>
        <div>
          <label className="label">طريقة الدفع (اختياري)</label>
          <input className="input" name="method" />
        </div>
        <div>
          <label className="label">ملاحظة (اختياري)</label>
          <input className="input" name="note" />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري التسجيل..." : "تسجيل"}
      </button>
    </form>
  );
}
