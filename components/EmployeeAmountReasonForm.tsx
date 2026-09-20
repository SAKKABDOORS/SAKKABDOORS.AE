"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Shared shape for both سند قبض (vouchers) and deductions — same two
// fields, just a different endpoint/button label.
export default function EmployeeAmountReasonForm({
  apiBase,
  reasonPlaceholder,
  submitLabel
}: {
  apiBase: string;
  reasonPlaceholder: string;
  submitLabel: string;
}) {
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
      reason: String(data.get("reason") || "").trim()
    };

    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر الحفظ. تحقق من الحقول.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">المبلغ</label>
        <input className="input" type="number" step="0.01" min="0.01" name="amount" required />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">السبب</label>
        <input className="input" name="reason" placeholder={reasonPlaceholder} required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "..." : submitLabel}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
