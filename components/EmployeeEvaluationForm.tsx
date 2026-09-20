"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeEvaluationForm({ employeeId }: { employeeId: string }) {
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
      score: Number(data.get("score") || 3),
      notes: String(data.get("notes") || "").trim() || undefined
    };

    const res = await fetch(`/api/system/employees/${employeeId}/evaluations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ التقييم.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">التقييم</label>
        <select className="input" name="score" defaultValue="3">
          <option value="5">5 — ممتاز</option>
          <option value="4">4 — جيد جداً</option>
          <option value="3">3 — جيد</option>
          <option value="2">2 — مقبول</option>
          <option value="1">1 — ضعيف</option>
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">ملاحظات (اختياري)</label>
        <input className="input" name="notes" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "..." : "إضافة تقييم"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
