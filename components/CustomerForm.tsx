"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, CustomerType } from "@prisma/client";

export default function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/system/customer-types")
      .then((res) => res.json())
      .then(setCustomerTypes)
      .catch(() => setCustomerTypes([]));
  }, []);

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
      address: String(form.get("address") || "").trim() || undefined,
      customerTypeId: String(form.get("customerTypeId") || "") || undefined
    };

    const url = customer ? `/api/system/customers/${customer.id}` : "/api/system/customers";
    const method = customer ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ بيانات العميل. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم (عربي)</label>
          <input className="input" name="nameAr" defaultValue={customer?.nameAr} required />
        </div>
        <div>
          <label className="label">Name (English, اختياري)</label>
          <input className="input" name="nameEn" defaultValue={customer?.nameEn ?? ""} />
        </div>
        <div>
          <label className="label">الهاتف</label>
          <input className="input" name="phone" dir="ltr" defaultValue={customer?.phone} required />
        </div>
        <div>
          <label className="label">الإيميل (اختياري)</label>
          <input className="input" name="email" type="email" dir="ltr" defaultValue={customer?.email ?? ""} />
        </div>
        <div>
          <label className="label">نوع العميل</label>
          <select className="input" name="customerTypeId" defaultValue={customer?.customerTypeId ?? ""}>
            <option value="">— بدون —</option>
            {customerTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">العنوان (اختياري)</label>
        <textarea className="input" name="address" rows={2} defaultValue={customer?.address ?? ""} />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
