"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConvertToInvoiceButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setLoading(true);
    setError(false);
    const res = await fetch("/api/system/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId })
    });
    setLoading(false);

    if (!res.ok) {
      setError(true);
      return;
    }

    const invoice = await res.json();
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleClick} disabled={loading} className="btn-secondary py-1.5 px-3 text-xs">
        {loading ? "..." : "تحويل لفاتورة"}
      </button>
      {error && <span className="text-xs text-red-600">تعذر التحويل</span>}
    </div>
  );
}
