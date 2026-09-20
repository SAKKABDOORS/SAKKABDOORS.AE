"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee } from "@prisma/client";

function toDateInputValue(date: Date | string | null): string {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

export default function EmployeeForm({ employee }: { employee?: Employee }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      nameAr: String(form.get("nameAr") || "").trim(),
      nameEn: String(form.get("nameEn") || "").trim() || undefined,
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim() || undefined,
      position: String(form.get("position") || "").trim() || undefined,
      monthlyWage: Number(form.get("monthlyWage") || 0),
      hireDate: String(form.get("hireDate") || "") || undefined,
      isActive: form.get("isActive") === "on"
    };

    const url = employee ? `/api/system/employees/${employee.id}` : "/api/system/employees";
    const method = employee ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ بيانات الموظف. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/employees");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={employee?.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English, اختياري)</label>
          <input className="input" name="nameEn" defaultValue={employee?.nameEn ?? ""} />
        </div>
        <div>
          <label className="label">الهاتف</label>
          <input className="input" name="phone" dir="ltr" defaultValue={employee?.phone} required />
        </div>
        <div>
          <label className="label">الإيميل (اختياري)</label>
          <input className="input" name="email" type="email" dir="ltr" defaultValue={employee?.email ?? ""} />
        </div>
        <div>
          <label className="label">الوظيفة (اختياري)</label>
          <input className="input" name="position" defaultValue={employee?.position ?? ""} />
        </div>
        <div>
          <label className="label">الراتب الشهري</label>
          <input className="input" type="number" step="0.01" min="0" name="monthlyWage" defaultValue={employee?.monthlyWage ?? 0} />
        </div>
        <div>
          <label className="label">تاريخ التعيين (اختياري)</label>
          <input className="input" type="date" name="hireDate" defaultValue={toDateInputValue(employee?.hireDate ?? null)} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={employee?.isActive ?? true} />
        نشط (يظهر بقوائم الاختيار)
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
