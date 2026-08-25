"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          {loading ? "..." : "تأكيد الحذف"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      حذف
    </button>
  );
}
