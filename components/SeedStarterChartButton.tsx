"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedStarterChartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/accounting/accounts/seed-starter", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError("تعذر تحميل دليل الحسابات الافتراضي");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleSeed} disabled={loading} className="btn-secondary">
        {loading ? "..." : "تحميل دليل الحسابات الافتراضي"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
