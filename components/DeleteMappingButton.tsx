"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteMappingButton({ mappingId }: { mappingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/accounting/mappings/${mappingId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      {loading ? "..." : "حذف"}
    </button>
  );
}
