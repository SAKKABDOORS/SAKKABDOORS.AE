"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Account } from "@prisma/client";

export default function CategoryMappingForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/accounting/mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, accountId })
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ الربط");
      return;
    }

    setCategory("");
    setAccountId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">التصنيف (category)</label>
        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="مثال: كهرباء" required dir="ltr" />
      </div>
      <div>
        <label className="label">الحساب</label>
        <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          <option value="">اختر حساب</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.code} — {a.nameAr}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "..." : "حفظ الربط"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
