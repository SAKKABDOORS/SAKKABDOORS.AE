"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Employee } from "@prisma/client";

export default function PayAllSalariesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    const listRes = await fetch("/api/system/employees");
    const employees: Employee[] = await listRes.json();
    const payable = employees.filter((e) => e.isActive && e.monthlyWage > 0);
    const total = payable.reduce((sum, e) => sum + e.monthlyWage, 0);

    if (payable.length === 0) {
      setLoading(false);
      setMessage("ما في موظفين عندهم راتب مسجّل لدفعه.");
      return;
    }

    const confirmed = confirm(
      `رح يتم دفع راتب ${payable.length} موظف بإجمالي ${total.toFixed(2)} AED. أكيد بدك تكمل؟`
    );
    if (!confirmed) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/system/employees/pay-all-salaries", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      setMessage("تعذر دفع الرواتب.");
      return;
    }

    const data = await res.json();
    setMessage(`تم دفع راتب ${data.paidCount} موظف بإجمالي ${data.totalAmount.toFixed(2)} AED.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={handleClick} disabled={loading} className="btn-secondary py-1.5 px-3 text-xs">
        {loading ? "..." : "دفع رواتب الجميع"}
      </button>
      {message && <p className="text-xs text-ink-800/70">{message}</p>}
    </div>
  );
}
