"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LowStockThresholdForm({ productId, threshold }: { productId: string; threshold: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = Number(data.get("lowStockThreshold"));

    const res = await fetch(`/api/system/warehouse/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lowStockThreshold: value })
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ حد التنبيه.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">تنبيهني إذا نزلت الكمية عن</label>
        <input className="input" type="number" min={0} name="lowStockThreshold" defaultValue={threshold} />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary py-2 px-4 text-sm">
        {loading ? "..." : "حفظ"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
