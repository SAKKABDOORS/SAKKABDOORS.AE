"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoicePaymentForm({ invoiceId, remaining }: { invoiceId: string; remaining: number }) {
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
      amount: Number(data.get("amount") || 0),
      method: String(data.get("method") || "").trim() || undefined,
      note: String(data.get("note") || "").trim() || undefined
    };

    const res = await fetch(`/api/system/invoices/${invoiceId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر تسجيل الدفعة. تحقق من المبلغ.");
      return;
    }

    form.reset();
    router.refresh();
  }

  if (remaining <= 0) {
    return <p className="text-sm font-medium text-emerald-700">الفاتورة مدفوعة بالكامل.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">المبلغ</label>
          <input className="input" type="number" step="0.01" min="0.01" max={remaining} name="amount" required />
        </div>
        <div>
          <label className="label">طريقة الدفع (اختياري)</label>
          <input className="input" name="method" placeholder="نقدي / تحويل بنكي" />
        </div>
        <div>
          <label className="label">ملاحظة (اختياري)</label>
          <input className="input" name="note" />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري التسجيل..." : "تسجيل الدفعة"}
      </button>
    </form>
  );
}
