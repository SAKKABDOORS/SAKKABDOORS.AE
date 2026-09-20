"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Generic small "حذف" button for list rows (vouchers, deductions) —
// fetches DELETE on `${apiBase}/${id}` and refreshes.
export default function DeleteRecordButton({ apiBase, id }: { apiBase: string; id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      {loading ? "..." : "حذف"}
    </button>
  );
}
