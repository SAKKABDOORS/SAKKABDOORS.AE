"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Account } from "@prisma/client";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from "@/lib/accounts";

export default function AccountForm({
  account,
  parentOptions,
  typeLocked
}: {
  account?: Account;
  parentOptions: Account[];
  typeLocked?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      code: String(form.get("code") || "").trim(),
      nameAr: String(form.get("nameAr") || "").trim(),
      nameEn: String(form.get("nameEn") || "").trim(),
      type: String(form.get("type") || ""),
      parentId: String(form.get("parentId") || "") || null,
      isActive: form.get("isActive") === "on"
    };

    const url = account ? `/api/accounting/accounts/${account.id}` : "/api/accounting/accounts";
    const method = account ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (res.status === 409) {
      const body = await res.json().catch(() => null);
      setError(body?.error === "code_taken" ? "الرمز مستخدم بحساب آخر" : "لا يمكن الحفظ — الحساب مرتبط بقيود موجودة");
      return;
    }
    if (!res.ok) {
      setError("تعذر حفظ الحساب. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/accounts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الرمز</label>
          <input className="input" name="code" defaultValue={account?.code} required dir="ltr" />
        </div>
        <div>
          <label className="label">النوع</label>
          <select className="input" name="type" defaultValue={account?.type ?? "ASSET"} required disabled={typeLocked}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          {typeLocked && <p className="mt-1 text-xs text-ink-800/60">النوع مقفل — الحساب فيه قيود مسجلة</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={account?.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English)</label>
          <input className="input" name="nameEn" defaultValue={account?.nameEn ?? ""} />
        </div>
      </div>

      <div>
        <label className="label">الحساب الأب (اختياري)</label>
        <select className="input" name="parentId" defaultValue={account?.parentId ?? ""}>
          <option value="">بدون</option>
          {parentOptions
            .filter((p) => p.id !== account?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.nameAr}</option>
            ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={account?.isActive ?? true} />
        مفعّل
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
