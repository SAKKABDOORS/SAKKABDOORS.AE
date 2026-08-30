"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UnblockVisitorButton({ visitorId }: { visitorId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleUnblock() {
    setLoading(true);
    setError(false);
    const res = await fetch(`/api/admin/blocked/${visitorId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleUnblock}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          {loading ? "..." : "تأكيد فك الحظر"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700"
        >
          إلغاء
        </button>
        {error && <span className="text-xs font-medium text-red-600">تعذر فك الحظر</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
    >
      فك الحظر
    </button>
  );
}
