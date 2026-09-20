"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeePaySalaryForm({ employeeId, monthlyWage }: { employeeId: string; monthlyWage: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const amountRaw = String(data.get("amount") || "").trim();

    const res = await fetch(`/api/system/employees/${employeeId}/pay-salary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountRaw ? Number(amountRaw) : undefined })
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر تسجيل دفعة الراتب.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">المبلغ (اختياري — الافتراضي: الراتب الشهري {monthlyWage.toFixed(2)} AED)</label>
        <input className="input" type="number" step="0.01" min="0.01" name="amount" placeholder={monthlyWage.toFixed(2)} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الدفع..." : "دفع الراتب"}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
