"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function toDateInputValue(date: Date | string | null): string {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

export default function InvoiceDueDateForm({ invoiceId, dueDate }: { invoiceId: string; dueDate: Date | string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = String(data.get("dueDate") || "");

    const res = await fetch(`/api/system/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: value || null })
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ تاريخ الاستحقاق.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">تاريخ الاستحقاق (اختياري)</label>
        <input className="input" type="date" name="dueDate" defaultValue={toDateInputValue(dueDate)} />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary py-2 px-4 text-sm">
        {loading ? "..." : "حفظ"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
