"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAccountButton({ accountId, hasLines }: { accountId: string; hasLines: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/accounting/accounts/${accountId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      setError("لا يمكن الحذف — الحساب مرتبط بقيود أو حسابات فرعية");
      return;
    }
    router.refresh();
  }

  if (hasLines) {
    return <span className="text-xs text-ink-800/40" title="لا يمكن حذف حساب فيه قيود — أوقفه بدل ذلك">مرتبط بقيود</span>;
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
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
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
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
